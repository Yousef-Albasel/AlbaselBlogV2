import { parentPath, replacePath } from './fileTree.js';

export const initialFileState = { files: [], folders: [], selectedPath: null, loading: true, error: null };
const history = () => ({ past: [], future: [], editedAt: 0 });

export function fileManagerReducer(state, action) {
  switch (action.type) {
    case 'tree': {
      const previous = new Map(state.files.map(file => [file.path, file]));
      const files = action.files.map(file => {
        const old = previous.get(file.path);
        previous.delete(file.path);
        return old?.modified || old?.lastModified === file.lastModified
          ? { ...file, ...old } : { ...file, id: old?.id || file.path, history: history() };
      });
      // An external deletion must not silently throw away an unsaved document.
      files.push(...[...previous.values()].filter(file => file.modified));
      return { ...state, files, folders: action.folders, error: null,
        selectedPath: files.some(file => file.path === state.selectedPath) ? state.selectedPath : null };
    }
    case 'select':
      return { ...state, selectedPath: action.path };
    case 'loaded':
      return { ...state, files: state.files.map(file => file.path === action.path && !file.modified
        ? { ...file, ...action.data } : file) };
    case 'edit':
      return { ...state, files: state.files.map(file => {
        if (file.path !== state.selectedPath || file.content === action.content) return file;
        const previous = file.history || history();
        const past = action.now - previous.editedAt > 500 || previous.future.length
          ? [...previous.past, file.content || ''].slice(-100) : previous.past;
        return { ...file, content: action.content, modified: true,
          history: { past, future: [], editedAt: action.now } };
      }) };
    case 'undo':
    case 'redo':
      return { ...state, files: state.files.map(file => {
        if (file.path !== state.selectedPath) return file;
        const previous = file.history || history();
        const undo = action.type === 'undo';
        const source = undo ? previous.past : previous.future;
        if (!source.length) return file;
        return { ...file, content: source[source.length - 1], modified: true,
          history: {
            past: undo ? previous.past.slice(0, -1) : [...previous.past, file.content].slice(-100),
            future: undo ? [...previous.future, file.content] : previous.future.slice(0, -1),
            editedAt: 0,
          } };
      }) };
    case 'saved':
      return { ...state, files: state.files.map(file => file.path === action.path
        ? { ...file, ...action.data, modified: file.content !== action.content } : file) };
    case 'relocate': {
      const relocate = item => {
        const path = replacePath(item.path, action.oldPath, action.newPath);
        return path === item.path ? item : { ...item, path, name: path.split('/').pop(),
          folder: parentPath(path), directory: path.split('/')[0] };
      };
      return { ...state, files: state.files.map(relocate), folders: state.folders.map(relocate),
        selectedPath: state.selectedPath && replacePath(state.selectedPath, action.oldPath, action.newPath) };
    }
    case 'delete':
      return { ...state, files: state.files.filter(file => file.path !== action.path),
        selectedPath: state.selectedPath === action.path ? null : state.selectedPath };
    case 'error': return { ...state, error: action.error };
    case 'ready': return { ...state, loading: false };
    default: return state;
  }
}
