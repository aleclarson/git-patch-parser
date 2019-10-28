export function parsePatch(contents) {
  const patch = {
    sha: /^From ([^ ]+)/.exec(contents)[1],
    message: /^Subject: \[.+?\] ([\S\s]+)?^---$/m.exec(contents)[1].trim(),
    changes: [],
  };

  const fileChunks = contents.split(/^diff --git /m);
  fileChunks.slice(1).forEach((chunk) => {
    // Parse the old filename.
    const fileMatch = /^--- a\/(.+)$/m.exec(chunk);
    const file = fileMatch && fileMatch[1];

    // Parse the new filename.
    const destMatch = /^\+\+\+ b\/(.+)$/m.exec(chunk);
    const dest = destMatch && destMatch[1];

    const change = {
      type: file ? (dest ? "change" : "delete") : "add",
      file: file || dest,
    };

    patch.changes.push(change);

    const diff = chunk.slice(chunk.indexOf("@@"));
    if (file && dest) {
      change.diff = parseUnifiedDiff(diff);

      // Renames come after any changes to the renamed file.
      if (file !== dest) {
        patch.changes.push({
          type: "rename",
          file,
          dest,
        });
      }
    } else {
      change.text = parseFirstChunk(diff);
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

  return patchIndices.map((_, i) => {
    const patchContent = contents
      .slice(patchIndices[i], patchIndices[i + 1])
      // Remove the weird -- 2.2.1 part at the end of every patch
      .split(/^-- $/m)[0];

    return parsePatch(patchContent);
  });
}

const lineRangeRE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

export function parseUnifiedDiff(contents) {
  const chunks = [];

  // Ignore the last line which is always empty
  const lines = contents.split(/\r?\n/).slice(0, -1);
  for (let i = 0; i < lines.length; i++) {
    const range = lines[i];

    // Every chunk begins with two line ranges.
    let rangeMatch = lineRangeRE.exec(range);
    if (!rangeMatch) {
      break;
    }

    const match = rangeMatch.map(Number);
    const chunk = {
      lines: [],
      inputRange: { start: match[1], length: match[2] },
      outputRange: { start: match[3], length: match[4] },
    };

    for (let line = lines[++i]; line && line[0] != "@"; line = lines[++i]) {
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
