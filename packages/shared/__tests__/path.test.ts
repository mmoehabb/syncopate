import { test, expect } from "bun:test";
import { resolvePath } from "../src/path";

test("resolvePath works correctly", () => {
  expect(resolvePath("/", "workspace")).toBe("/workspace");
  expect(resolvePath("/workspace", "board")).toBe("/workspace/board");
  expect(resolvePath("/workspace/board", "..")).toBe("/workspace");
  expect(resolvePath("/workspace", "..")).toBe("/");
  expect(resolvePath("/", "..")).toBe("/");
  expect(resolvePath("/workspace/board", "~")).toBe("/");
  expect(resolvePath("/workspace/board", "~/other_workspace")).toBe(
    "/other_workspace",
  );
  expect(resolvePath("/workspace/board", "/other_workspace")).toBe(
    "/other_workspace",
  );
  expect(resolvePath("/workspace/board", ".")).toBe("/workspace/board");
  expect(resolvePath("/workspace/board", "./task")).toBe(
    "/workspace/board/task",
  );
});
