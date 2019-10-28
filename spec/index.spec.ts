import * as fs from "fs";
import * as path from "path";
import { parsePatch, parseMultiPatch } from "..";

beforeAll(() => {
  process.chdir(__dirname);
});

it("Parses file renames", () => {
  const contents = getFixture("rename.patch");
  const parsed = parsePatch(contents);
  expect(parsed).toMatchSnapshot();
});

it("Parses file deletions", () => {
  const contents = getFixture("delete.patch");
  const parsed = parsePatch(contents);
  expect(parsed).toMatchSnapshot();
});

it("Parses file additions", () => {
  const contents = getFixture("add.patch");
  const parsed = parsePatch(contents);
  expect(parsed).toMatchSnapshot();
});

it.todo("Parses trailing newlines");

describe("Reading single patch", () => {
  it("Parses the example patch", () => {
    const contents = getFixture("react.single.patch");
    const parsed = parsePatch(contents);
    expect(parsed).toMatchSnapshot();
  });
});

describe("Reading multi patch", () => {
  it("Parses the example patch", () => {
    const contents = getFixture("react.multi.patch");
    const parsed = parseMultiPatch(contents);
    expect(parsed).toMatchSnapshot();
  });
});

function getFixture(fixture: string) {
  return fs.readFileSync(path.join("__fixtures__", fixture), "utf8");
}
