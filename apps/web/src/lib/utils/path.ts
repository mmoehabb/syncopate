export function resolvePath(currentPath: string, targetPath: string): string {
  // If absolute path or home
  if (targetPath.startsWith('/')) {
    currentPath = '/';
    targetPath = targetPath.substring(1);
  } else if (targetPath.startsWith('~')) {
    currentPath = '/';
    targetPath = targetPath.substring(1);
    if (targetPath.startsWith('/')) {
      targetPath = targetPath.substring(1);
    }
  }

  const currentParts = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);
  const targetParts = targetPath.split('/').filter(Boolean);

  const resolvedParts = [...currentParts];

  for (const part of targetParts) {
    if (part === '.') {
      continue;
    } else if (part === '..') {
      if (resolvedParts.length > 0) {
        resolvedParts.pop();
      }
    } else {
      resolvedParts.push(part);
    }
  }

  return '/' + resolvedParts.join('/');
}
