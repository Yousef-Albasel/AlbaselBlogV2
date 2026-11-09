import { request, jsonRequest } from './api';

const fileEndpoint = path => `/file/${path.split('/').map(encodeURIComponent).join('/')}`;

export const fileService = {
  loadTree: () => request('/tree'),
  loadFileContent: path => request(fileEndpoint(path)),
  saveFile: (path, content, createOnly = false) =>
    jsonRequest(fileEndpoint(path), 'POST', { content, createOnly }),
  deleteFile: path => request(fileEndpoint(path), { method: 'DELETE' }),
  renameFile: (oldPath, newName) => jsonRequest('/files/rename', 'PUT', { oldPath, newName }),
  moveFile: (oldPath, newPath) => jsonRequest('/files/move', 'POST', { oldPath, newPath }),
  renameFolder: (oldPath, newName) => jsonRequest('/folders', 'PUT', { oldPath, newName }),
  createFolder: (folderPath, createIndex = true) =>
    jsonRequest('/folders', 'POST', { folderPath, createIndex }),
};
