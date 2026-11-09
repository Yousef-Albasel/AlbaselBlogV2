export const parentPath = path => path.slice(0, path.lastIndexOf('/'));
export const replacePath = (path, oldPath, newPath) =>
  path === oldPath || path.startsWith(`${oldPath}/`) ? newPath + path.slice(oldPath.length) : path;

// Index folders once instead of scanning all folders at every tree level.
export function buildFileTree(files = [], folders = []) {
  const nodes = new Map();
  function ensureFolder(path) {
    if (!nodes.has(path)) {
      const node = { name: path.split('/').pop(), path, type: 'folder', files: [], children: [] };
      nodes.set(path, node);
      if (path.includes('/')) ensureFolder(parentPath(path)).children.push(node);
    }
    return nodes.get(path);
  }
  ensureFolder('content');
  for (const folder of folders) ensureFolder(folder.path);
  for (const file of files) ensureFolder(parentPath(file.path)).files.push(file);
  for (const node of nodes.values()) {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    node.files.sort((a, b) => a.name.localeCompare(b.name));
  }
  return [...nodes.values()].filter(node => !node.path.includes('/'));
}
