const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

function validateName(name) {
  if (typeof name !== 'string' || !name.trim() || name !== name.trim() ||
      /[<>:"/\\|?*\x00-\x1f]/.test(name) || /[. ]$/.test(name) ||
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) {
    fail(400, 'Enter a valid file or folder name');
  }
}

function createContentStore(projectDir) {
  const root = path.resolve(projectDir);

  // Resolve every operation through the same boundary, including symlink checks.
  async function resolve(relative, { allowRoot = false, markdown = false } = {}) {
    if (typeof relative !== 'string') fail(400, 'Path is required');
    const parts = relative.split('/');
    if (!['content', 'pages'].includes(parts[0]) || (!allowRoot && parts.length < 2)) {
      fail(403, 'Path must be inside content/ or pages/');
    }
    parts.forEach(validateName);
    if (markdown && !relative.endsWith('.md')) fail(400, 'File name must end with .md');
    let full = root;
    for (const part of parts) {
      full = path.join(full, part);
      try {
        if ((await fs.lstat(full)).isSymbolicLink()) fail(403, 'Symbolic links are not supported');
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    return full;
  }

  async function list() {
    const files = [];
    const folders = [];
    async function walk(relative) {
      const full = await resolve(relative, { allowRoot: true });
      if (!await fs.pathExists(full)) return;
      folders.push({ name: path.posix.basename(relative), path: relative, type: 'folder' });
      const entries = await fs.readdir(full, { withFileTypes: true });
      for (const entry of entries) {
        const child = `${relative}/${entry.name}`;
        if (entry.isDirectory()) await walk(child);
        else if (entry.isFile() && entry.name.endsWith('.md')) {
          const stats = await fs.stat(path.join(full, entry.name));
          files.push({ name: entry.name, path: child, directory: relative.split('/')[0],
            folder: relative, lastModified: stats.mtime.toISOString(), size: stats.size });
        }
      }
    }
    await walk('content');
    await walk('pages');
    files.sort((a, b) => b.lastModified.localeCompare(a.lastModified) || a.path.localeCompare(b.path));
    return { files, folders };
  }

  async function read(filePath) {
    const full = await resolve(filePath, { markdown: true });
    const content = await fs.readFile(full, 'utf8');
    const stats = await fs.stat(full);
    let parsed = { data: {}, content };
    try { parsed = matter(content); } catch { /* Keep malformed frontmatter editable. */ }
    return { content, frontMatter: parsed.data, markdownContent: parsed.content,
      lastModified: stats.mtime.toISOString(), size: stats.size };
  }

  async function save(filePath, content, createOnly = false) {
    if (typeof content !== 'string') fail(400, 'Content must be a string');
    const full = await resolve(filePath, { markdown: true });
    await fs.ensureDir(path.dirname(full));
    await fs.writeFile(full, content, { encoding: 'utf8', flag: createOnly ? 'wx' : 'w' });
    const stats = await fs.stat(full);
    return { success: true, lastModified: stats.mtime.toISOString(), size: stats.size };
  }

  async function createFolder(folderPath, createIndex = true) {
    const full = await resolve(folderPath);
    await fs.ensureDir(full);
    if (createIndex) {
      const name = path.basename(full);
      const content = matter.stringify(`\n# ${name}\n\n`, {
        title: name, description: '', category: '',
        date: new Date().toISOString().slice(0, 10), layout: 'series',
      });
      try {
        await fs.writeFile(path.join(full, '_index.md'), content, { flag: 'wx' });
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
    }
    return { success: true, path: folderPath };
  }

  async function move(oldPath, newPath, folder = false) {
    const source = await resolve(oldPath, { markdown: !folder });
    const destination = await resolve(newPath, { markdown: !folder });
    const stats = await fs.lstat(source);
    if (folder ? !stats.isDirectory() : !stats.isFile()) fail(400, 'Unexpected item type');
    if (oldPath === newPath) return { success: true, newPath };
    if (folder && newPath.startsWith(`${oldPath}/`)) fail(400, 'Cannot move a folder into itself');
    if (!await fs.pathExists(path.dirname(destination))) fail(404, 'Destination folder not found');
    // fs-extra rejects collisions; never overwrite another document.
    await fs.move(source, destination, { overwrite: false });
    return { success: true, newPath };
  }

  async function rename(oldPath, newName, folder = false) {
    validateName(newName);
    return move(oldPath, `${path.posix.dirname(oldPath)}/${newName}`, folder);
  }

  async function remove(filePath) {
    await fs.unlink(await resolve(filePath, { markdown: true }));
    return { success: true };
  }

  return { list, read, save, createFolder, move, rename, remove };
}

module.exports = { createContentStore };
