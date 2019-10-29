import * as fs from "fs";
import * as path from "path";
import { parsePatch, parseMultiPatch } from "..";

beforeAll(() => {
  process.chdir(__dirname);
});

it("can parse a renamed file", () => {
  const contents = getFixture("rename.patch");
  const parsed = parsePatch(contents);
  expect(parsed).toMatchSnapshot();
});

it("can parse a deleted file", () => {
  const contents = getFixture("delete.patch");
  const parsed = parsePatch(contents);
  expect(parsed).toMatchSnapshot();
});

it("can parse an added file", () => {
  const contents = getFixture("add.patch");
  const parsed = parsePatch(contents);
  expect(parsed).toMatchSnapshot();
});

fit("can parse multiple diffs for one file", () => {
  const contents = getFixture("changes.patch");
  const parsed = parsePatch(contents);
  expect(parsed).toMatchSnapshot();
});

it("can parse multiple patches at once", () => {
  const contents = getFixture("multi.patch");
  const parsed = parseMultiPatch(contents);
  expect(parsed).toMatchSnapshot();
});

it.todo("can parse the removal of a trailing newline");

function getFixture(fixture: string) {
  return fs.readFileSync(path.join("__fixtures__", fixture), "utf8");
}
