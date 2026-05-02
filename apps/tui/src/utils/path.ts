/**
 * Resolves a target path relative to the current path.
 *
 * It handles absolute paths, home paths ('~'), and relative navigation ('.' and '..').
 *
 * @example
 * resolvePath("/workspace", "board-1") // returns "/workspace/board-1"
 * resolvePath("/workspace/board-1", "..") // returns "/workspace"
 * resolvePath("/workspace/board-1", "~") // returns "/"
 *
 * @param currentPath The base path from which to resolve.
 * @param targetPath The destination path to resolve.
 * @returns The new absolute resolved path.
 */
export function resolvePath(currentPath: string, targetPath: string): string {
  // If absolute path or home
  if (targetPath.startsWith("/")) {
    currentPath = "/";
    targetPath = targetPath.substring(1);
  } else if (targetPath.startsWith("~")) {
    currentPath = "/";
    targetPath = targetPath.substring(1);
    if (targetPath.startsWith("/")) {
      targetPath = targetPath.substring(1);
    }
  }

  const currentParts =
    currentPath === "/" ? [] : currentPath.split("/").filter(Boolean);
  const targetParts = targetPath.split("/").filter(Boolean);

  const resolvedParts = [...currentParts];

  for (const part of targetParts) {
    if (part === ".") {
      continue;
    } else if (part === "..") {
      if (resolvedParts.length > 0) {
        resolvedParts.pop();
      }
    } else {
      resolvedParts.push(part);
    }
  }

  return "/" + resolvedParts.join("/");
}
