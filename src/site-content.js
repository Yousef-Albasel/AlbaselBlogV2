const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const renderMarkdown = require('./markdown');

const folderSlug = relative => relative.split('/').map(part => part.toLowerCase().replace(/\s+/g, '-')).join('/');

async function readDocument(fullPath, slug, layout) {
  const { data, content } = matter(await fs.readFile(fullPath, 'utf8'));
  return {
    title: path.posix.basename(slug), description: '', category: '', image: '',
    date: new Date().toISOString().slice(0, 10), layout, order: 0,
    ...data, slug, url: `/${slug}.html`, frontMatter: data, ...renderMarkdown(content),
  };
}

async function processMarkdownFiles(projectDir) {
  const root = path.join(projectDir, 'content');
  const posts = [];
  const series = [];
  if (!await fs.pathExists(root)) return { posts, series };

  async function visit(relative = '') {
    const directory = path.join(root, relative);
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    const slug = folderSlug(relative);
    const hasIndex = relative && entries.some(entry => entry.isFile() && entry.name === '_index.md');
    const children = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await visit(relative ? `${relative}/${entry.name}` : entry.name);
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
        const postSlug = [slug, entry.name.slice(0, -3)].filter(Boolean).join('/');
        const post = await readDocument(path.join(directory, entry.name), postSlug, 'post');
        post.series = hasIndex ? slug : null;
        children.push(post);
        posts.push(post);
      }
    }
    if (!hasIndex) return;
    children.sort((a, b) => a.order - b.order || new Date(a.date) - new Date(b.date));
    const item = await readDocument(path.join(directory, '_index.md'), slug, 'series');
    children.forEach((post, index) => {
      post.seriesInfo = {
        title: item.title, slug, currentIndex: index + 1, totalPosts: children.length,
        previousPost: children[index - 1] || null, nextPost: children[index + 1] || null,
      };
    });
    series.push({ ...item, url: `/${slug}/index.html`, posts: children, postCount: children.length });
  }
  await visit();
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return { posts, series };
}

async function processPages(projectDir) {
  const root = path.join(projectDir, 'pages');
  const pages = [];
  if (!await fs.pathExists(root)) return pages;
  async function visit(relative = '') {
    const entries = await fs.readdir(path.join(root, relative), { withFileTypes: true });
    for (const entry of entries) {
      const child = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await visit(child);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        const slug = entry.name === '_index.md'
          ? `${folderSlug(relative)}/index`.replace(/^\//, '')
          : [folderSlug(relative), entry.name.slice(0, -3)].filter(Boolean).join('/');
        pages.push(await readDocument(path.join(root, child), slug, 'page'));
      }
    }
  }
  await visit();
  return pages;
}

module.exports = { processMarkdownFiles, processPages };
