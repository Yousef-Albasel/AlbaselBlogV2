const express = require('express');
const { createContentStore } = require('./content-store');

module.exports = function createContentRouter(projectDir) {
  const router = express.Router();
  const store = createContentStore(projectDir);
  router.get('/tree', async (req, res) => res.json(await store.list()));
  router.get('/files', async (req, res) => res.json((await store.list()).files));
  router.post('/folders', async (req, res) => {
    res.json(await store.createFolder(req.body.folderPath, req.body.createIndex ?? true));
  });
  router.put('/folders', async (req, res) => {
    res.json(await store.rename(req.body.oldPath, req.body.newName, true));
  });
  router.post('/files/move', async (req, res) => {
    res.json(await store.move(req.body.oldPath, req.body.newPath));
  });
  router.put('/files/rename', async (req, res) => {
    res.json(await store.rename(req.body.oldPath, req.body.newName));
  });
  router.use('/file', async (req, res) => {
    const filePath = decodeURIComponent(req.url.split('?')[0].slice(1));
    switch (req.method) {
      case 'GET': return res.json(await store.read(filePath));
      case 'POST': return res.json(await store.save(filePath, req.body.content, req.body.createOnly));
      case 'DELETE': return res.json(await store.remove(filePath));
      default: return res.status(405).json({ error: 'Method not allowed' });
    }
  });
  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status || (error.code === 'ENOENT' ? 404 :
      error.code === 'EEXIST' || /already exists/.test(error.message) ? 409 :
      error instanceof URIError ? 400 : 500);
    res.status(status).json({ error: error.message });
  });
  return router;
};
