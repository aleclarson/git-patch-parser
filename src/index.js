export function parsePatch(contents) {
  const patch = {
    sha: /^From ([^ ]+)/.exec(contents)[1],
    message: /^Subject: \[.+?\] ([\S\s]+)?^---$/m.exec(contents)[1].trim(),
    changes: [],
  };

  // Remove the weird -- 2.2.1 part at the end of every patch
  contents = contents.split(/^-- $/m)[0];

  const fileChunks = contents.split(/^diff --git /m);
  fileChunks.slice(1).forEach((chunk) => {
    // Parse the old filename.
    const fileMatch = /^--- a\/(.+)$/m.exec(chunk);
    let file = fileMatch && fileMatch[1];

    // Parse the new filename.
    const destMatch = /^\+\+\+ b\/(.+)$/m.exec(chunk);
    let dest = destMatch && destMatch[1];

    if (!file && !dest) {
      const renameFrom = /^rename from (.+)$/m.exec(chunk);
      const renameTo = /^rename to (.+)$/m.exec(chunk);
      if (renameFrom && renameTo) {
        file = renameFrom[1];
        dest = renameTo[1];
      }
    }

    const change = {
      type: file ? (dest ? "change" : "delete") : "add",
      file: file || dest,
    };

    const diff = chunk.slice(chunk.indexOf("@@"));
    if (file) {
      change.diff = parseUnifiedDiff(diff);
      if (change.diff.length) {
        patch.changes.push(change);
      }
      if (dest && file !== dest) {
        patch.changes.push({
          type: "rename",
          file,
          dest,
        });
      }
    } else {
      change.text = parseFirstChunk(diff);
      patch.changes.push(change);
    }
  });

  return patch;
}

export function parseMultiPatch(contents) {
  const patchStart = /^From /gm;

  let match = null;
  const patchIndices = [];
  while ((match = patchStart.exec(contents)) != null) {
    patchIndices.push(match.index);
  }

  return patchIndices.map((_, i) =>
    parsePatch(contents.slice(patchIndices[i], patchIndices[i + 1]))
  );
}

const lineRangeRE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

export function parseUnifiedDiff(contents) {
  const chunks = [];

  // Ignore the last line which is always empty
  const lines = contents.split(/\r?\n/).slice(0, -1);
  for (let i = 0; i < lines.length; ) {
    // Every chunk begins with two line ranges.
    let match = lineRangeRE.exec(lines[i]);
    if (!match) {
      break;
    }

    const range = match.map(Number);
    const chunk = {
      lines: [],
      inputRange: { start: range[1], length: range[2] },
      outputRange: { start: range[3], length: range[4] },
    };

    for (
      let line = lines[++i];
      line != null && line[0] != "@";
      line = lines[++i]
    ) {
      // Lines that begin with a backslash are not actual lines.
      // For example, the removal of a trailing newline.
      if (line[0] == "\\") {
        continue;
      }
      chunk.lines.push({
        prefix: line[0],
        text: line.slice(1),
      });
    }

    chunks.push(chunk);
  }

  return chunks;
}

// Parse the contents of the first chunk in a diff.
function parseFirstChunk(diff) {
  return diff
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.slice(1))
    .join("\n");
}
