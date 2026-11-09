import { useState, useRef, useEffect, useCallback } from 'react';
import { fileService } from '../services/fileService';
import { createDefaultContent, validateFileName, parseUrlParams } from '../utils/fileUtils';
import { fileManagerReducer, initialFileState } from '../utils/fileManagerState';

export const useFileManager = () => {
  const [state, setState] = useState(initialFileState);
  const current = useRef(state);
  const selectionRequest = useRef(0);
  const mutation = useRef(false);
  const [busy, setBusy] = useState(false);

  const dispatch = useCallback(action => {
    current.current = fileManagerReducer(current.current, action);
    setState(current.current);
  }, []);

  const refresh = useCallback(async () => {
    const tree = await fileService.loadTree();
    dispatch({ type: 'tree', ...tree });
    return tree;
  }, [dispatch]);

  const select = useCallback(async file => {
    const requestId = ++selectionRequest.current;
    const latest = current.current.files.find(item => item.path === file?.path);
    if (!latest) return;
    if (latest.content !== undefined) {
      dispatch({ type: 'select', path: latest.path });
      return;
    }
    const data = await fileService.loadFileContent(latest.path);
    if (requestId !== selectionRequest.current) return;
    dispatch({ type: 'loaded', path: latest.path, data });
    dispatch({ type: 'select', path: latest.path });
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        let tree = await fileService.loadTree();
        if (cancelled) return;
        const { file: requested, create } = parseUrlParams();
        if (requested && create && !tree.files.some(file => file.path === requested)) {
          const name = requested.split('/').pop();
          await fileService.saveFile(requested, createDefaultContent(name, requested.split('/')[0]), true);
          tree = await fileService.loadTree();
        }
        if (cancelled) return;
        dispatch({ type: 'tree', ...tree });
        const first = tree.files.find(file => file.path === requested) || tree.files[0];
        if (first) await select(first);
      } catch (error) {
        if (!cancelled) dispatch({ type: 'error', error: error.message });
      } finally {
        if (!cancelled) dispatch({ type: 'ready' });
      }
    }
    initialize();
    return () => { cancelled = true; selectionRequest.current++; };
  }, [dispatch, select]);

  // Exclude concurrent mutations so a save cannot recreate the old path during a move.
  async function run(operation) {
    if (mutation.current) return false;
    mutation.current = true;
    selectionRequest.current++;
    setBusy(true);
    dispatch({ type: 'error', error: null });
    try {
      await operation();
      return true;
    } catch (error) {
      dispatch({ type: 'error', error: error.message });
      return false;
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }

  const handleFileSelect = async file => {
    if (mutation.current) return;
    try { await select(file); }
    catch (error) { dispatch({ type: 'error', error: error.message }); }
  };

  const handleCreateFile = (folderPath = 'content', fileName) => run(async () => {
    const validation = validateFileName(fileName);
    if (!validation.valid) throw new Error(validation.error);
    const path = `${folderPath || 'content'}/${fileName}`;
    await fileService.saveFile(path, createDefaultContent(fileName, path.split('/')[0]), true);
    const tree = await refresh();
    await select(tree.files.find(file => file.path === path));
  });

  const handleCreateFolder = (parent = 'content', name) => run(async () => {
    if (!name?.trim()) throw new Error('Folder name is required');
    await fileService.createFolder(`${parent}/${name.trim().toLowerCase().replace(/\s+/g, '-')}`);
    await refresh();
  });

  const relocate = (item, operation) => run(async () => {
    const result = await operation();
    dispatch({ type: 'relocate', oldPath: item.path, newPath: result.newPath });
  });

  async function save(file) {
    const data = await fileService.saveFile(file.path, file.content);
    dispatch({ type: 'saved', path: file.path, content: file.content, data });
  }

  const selectedFile = state.files.find(file => file.path === state.selectedPath) || null;
  return {
    ...state, selectedFile, busy,
    handleFileSelect,
    handleContentChange: content => dispatch({ type: 'edit', content, now: Date.now() }),
    handleUndo: () => dispatch({ type: 'undo' }),
    handleRedo: () => dispatch({ type: 'redo' }),
    handleCreateFile,
    handleCreateFolder,
    handleRenameFile: (file, name) => relocate(file, () => fileService.renameFile(file.path, name)),
    handleRenameFolder: (folder, name) => relocate(folder, () => fileService.renameFolder(folder.path, name)),
    handleMoveFile: (file, folder) => relocate(file, () => fileService.moveFile(file.path, `${folder}/${file.name}`)),
    handleDeleteFile: file => run(async () => {
      await fileService.deleteFile(file.path);
      dispatch({ type: 'delete', path: file.path });
      if (!current.current.selectedPath && current.current.files.length) await select(current.current.files[0]);
    }),
    handleSave: () => run(async () => {
      const file = current.current.files.find(file => file.path === current.current.selectedPath);
      if (file?.content !== undefined) await save(file);
    }),
    handleSaveAll: () => run(async () => {
      // Commit successful saves individually, even if another file fails.
      const results = await Promise.allSettled(current.current.files.filter(file => file.modified).map(save));
      const failed = results.filter(result => result.status === 'rejected');
      if (failed.length) throw new Error(failed.map(result => result.reason.message).join('; '));
    }),
    handleRefreshFiles: () => run(async () => {
      await refresh();
      const file = current.current.files.find(file => file.path === current.current.selectedPath) || current.current.files[0];
      if (file) await select(file);
    }),
    clearError: () => dispatch({ type: 'error', error: null }),
    hasModifiedFiles: state.files.some(file => file.modified),
  };
};
