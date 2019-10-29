export interface DiffLine {
  prefix: " " | "+" | "-";
  text: string;
}

export interface DiffRange {
  start: number;
  length: number;
}

export interface DiffChunk {
  lines: DiffLine[];
  inputRange: DiffRange;
  outputRange: DiffRange;
}

export type ParsedChange =
  | { type: "add"; file: string; text: string }
  | { type: "rename"; file: string; dest: string }
  | { type: "change"; file: string; diff: DiffChunk[] }
  | { type: "delete"; file: string; diff: DiffChunk[] };

export interface ParsedPatch {
  sha: string;
  message: string;
  changes: ParsedChange[];
}

export function parsePatch(contents: string): ParsedPatch;
export function parseMultiPatch(contents: string): ParsedPatch[];
export function parseUnifiedDiff(contents: string): DiffChunk[];
