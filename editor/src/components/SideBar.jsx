import { useState, useRef, useEffect, useMemo } from 'react';
import { FileText, Folder, FolderOpen, Trash2, Plus, FolderPlus, X, Check } from 'lucide-react';
import { buildFileTree, parentPath, replacePath } from '../utils/fileTree';

const FILE_DRAG_TYPE = 'application/x-vertex-file';

export default function Sidebar({ 
  files,
  folders,
  busy,
  createRequest,
  onMoveFile, 
  selectedFile, 
  onFileSelect, 
  onCreateFile, 
  onCreateFolder, 
  onDeleteFile,
  onRenameFile,
  onRenameFolder,
  isDarkMode 
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['content', 'pages']));
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [originalName, setOriginalName] = useState(''); // Track original for comparison
  
  // Inline creation state
  const [creatingItem, setCreatingItem] = useState(null); // { type: 'file'|'folder', parentPath: string }
  const [createValue, setCreateValue] = useState('');
  
  const [dropTarget, setDropTarget] = useState(null);
  const draggedFile = useRef(null);
  const renameInputRef = useRef(null);
  const createInputRef = useRef(null);

  useEffect(() => {
    if (!createRequest) return;
    setExpandedFolders(previous => new Set([...previous, 'content']));
    setCreatingItem({ type: 'file', parentPath: 'content' });
    setCreateValue('');
  }, [createRequest]);

  // Focus inputs when they appear
  useEffect(() => {
    if (renamingItem && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingItem]);

  useEffect(() => {
    if (creatingItem && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [creatingItem]);

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDeleteClick = (e, file) => {
    e.stopPropagation();
    onDeleteFile(file);
  };

  // === RENAME LOGIC ===
  const startRename = (item, type) => {
    if (type === 'folder' && !item.path.includes('/')) return;
    setRenamingItem({ ...item, type });
    if (type === 'file') {
      const nameWithoutExt = item.name.replace(/\.md$/, '');
      setRenameValue(nameWithoutExt);
      setOriginalName(nameWithoutExt);
    } else {
      const folderName = item.name.split('/').pop();
      setRenameValue(folderName);
      setOriginalName(folderName);
    }
  };

  const handleRenameSubmit = async () => {
    if (!renamingItem) return;
    
    const trimmedValue = renameValue.trim();
    
    // Only submit if name changed and is not empty
    if (!trimmedValue || trimmedValue === originalName) {
      handleRenameCancel();
      return;
    }

    try {
      if (renamingItem.type === 'file') {
        const newFileName = trimmedValue.endsWith('.md') 
          ? trimmedValue 
          : trimmedValue + '.md';
        if (!await onRenameFile(renamingItem, newFileName)) return;
      } else {
        if (!await onRenameFolder(renamingItem, trimmedValue)) return;
        const newPath = `${parentPath(renamingItem.path)}/${trimmedValue}`;
        setExpandedFolders(previous => new Set([...previous].map(path => replacePath(path, renamingItem.path, newPath))));
      }
    } catch (error) {
      console.error('Rename failed:', error);
    }
    
    setRenamingItem(null);
    setRenameValue('');
    setOriginalName('');
  };

  const handleRenameCancel = () => {
    setRenamingItem(null);
    setRenameValue('');
    setOriginalName('');
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  const handleRenameBlur = (event) => {
    if (!event.currentTarget.parentElement.contains(event.relatedTarget)) handleRenameCancel();
  };

  const handleDoubleClick = (item, type) => {
    startRename(item, type);
  };

  // === INLINE CREATION LOGIC ===
  const startCreateFile = (parentPath) => {
    // Expand the folder first
    setExpandedFolders(prev => new Set([...prev, parentPath]));
    setCreatingItem({ type: 'file', parentPath });
    setCreateValue('');
  };

  const startCreateFolder = (parentPath) => {
    setExpandedFolders(prev => new Set([...prev, parentPath]));
    setCreatingItem({ type: 'folder', parentPath });
    setCreateValue('');
  };

  const handleCreateSubmit = async () => {
    if (!creatingItem) return;
    
    const trimmedValue = createValue.trim();
    if (!trimmedValue) {
      handleCreateCancel();
      return;
    }

    try {
      if (creatingItem.type === 'file') {
        const fileName = trimmedValue.endsWith('.md') ? trimmedValue : trimmedValue + '.md';
        if (!await onCreateFile(creatingItem.parentPath, fileName)) return;
      } else {
        if (!await onCreateFolder(creatingItem.parentPath, trimmedValue)) return;
      }
    } catch (error) {
      console.error('Creation failed:', error);
    }
    
    setCreatingItem(null);
    setCreateValue('');
  };

  const handleCreateCancel = () => {
    setCreatingItem(null);
    setCreateValue('');
  };

  const handleCreateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCreateCancel();
    }
  };

  const handleCreateBlur = (event) => {
    if (!event.currentTarget.parentElement.contains(event.relatedTarget)) handleCreateCancel();
  };

  const canDrop = folder => !busy && draggedFile.current && parentPath(draggedFile.current.path) !== folder;
  const handleDragOver = (event, folder) => {
    if (!canDrop(folder)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(folder);
  };
  const handleDrop = async (event, folder) => {
    event.preventDefault();
    event.stopPropagation();
    const file = draggedFile.current;
    const valid = canDrop(folder) && event.dataTransfer.getData(FILE_DRAG_TYPE) === file.path;
    draggedFile.current = null;
    setDropTarget(null);
    if (valid && await onMoveFile(file, folder)) {
      setExpandedFolders(previous => new Set([...previous, folder]));
    }
  };

  // Inline creation input component
  const renderCreateInput = (folderPath, depth, type) => {
    if (!creatingItem || creatingItem.parentPath !== folderPath || creatingItem.type !== type) {
      return null;
    }

    return (
      <div 
        className={`flex items-center gap-2 p-2 rounded ${
          isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
        }`}
        style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }}
      >
        {type === 'file' ? (
          <FileText size={14} className="flex-shrink-0 text-blue-500" />
        ) : (
          <Folder size={14} className="flex-shrink-0 text-blue-500" />
        )}
        <input
          ref={createInputRef}
          type="text"
          value={createValue}
          onChange={(e) => setCreateValue(e.target.value)}
          onKeyDown={handleCreateKeyDown}
          onBlur={handleCreateBlur}
          placeholder={type === 'file' ? 'filename.md' : 'folder-name'}
          className={`flex-1 px-2 py-1 text-sm border rounded ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          }`}
        />
        <button disabled={busy}
          onClick={handleCreateSubmit}
          className="p-1 rounded hover:bg-green-500 hover:text-white text-green-500"
          title="Create"
        >
          <Check size={14} />
        </button>
        <button disabled={busy}
          onClick={handleCreateCancel}
          className="p-1 rounded hover:bg-red-500 hover:text-white text-red-500"
          title="Cancel"
        >
          <X size={14} />
        </button>
      </div>
    );
  };

  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node) => {
      if (node.type === 'folder') {
        const isExpanded = expandedFolders.has(node.path);
        const hasFiles = node.files && node.files.length > 0;
        const hasSubfolders = node.children && node.children.length > 0;
        const totalFiles = hasFiles ? node.files.length : 0;
        const isRenaming = renamingItem?.path === node.path && renamingItem?.type === 'folder';
        const isCreatingFileHere = creatingItem?.parentPath === node.path && creatingItem?.type === 'file';
        const isCreatingFolderHere = creatingItem?.parentPath === node.path && creatingItem?.type === 'folder';
        
        return (
          <div key={node.path} className="mb-1">
            <div
              onDragOver={event => handleDragOver(event, node.path)}
              onDrop={event => handleDrop(event, node.path)}
              onDragLeave={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget(null);
              }}
              className={`flex items-center gap-1 group rounded ${dropTarget === node.path ? 'ring-2 ring-blue-500 bg-blue-500/20' : ''}`}
            >
              {isRenaming ? (
                <div className="flex-1 flex items-center gap-1" style={{ paddingLeft: `${depth * 16 + 4}px` }}>
                  {isExpanded ? 
                    <FolderOpen size={16} className="text-blue-600 flex-shrink-0" /> : 
                    <Folder size={16} className="text-blue-600 flex-shrink-0" />
                  }
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={handleRenameBlur}
                    className={`flex-1 px-2 py-1 text-sm border rounded ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <button disabled={busy} onClick={handleRenameSubmit} className="p-1 text-green-500 hover:bg-green-500 hover:text-white rounded">
                    <Check size={12} />
                  </button>
                  <button disabled={busy} onClick={handleRenameCancel} className="p-1 text-red-500 hover:bg-red-500 hover:text-white rounded">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button disabled={busy}
                  onClick={() => toggleFolder(node.path)}
                  onDoubleClick={() => handleDoubleClick(node, 'folder')}
                  className={`flex items-center gap-1 flex-1 text-left p-1 rounded text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-200'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                  style={{ paddingLeft: `${depth * 16 + 4}px` }}
                >
                  {isExpanded ? 
                    <FolderOpen size={16} className="text-blue-600 flex-shrink-0" /> : 
                    <Folder size={16} className="text-blue-600 flex-shrink-0" />
                  }
                  <span className="truncate">{node.name}/</span>
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
                    isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {totalFiles}
                  </span>
                </button>
              )}
              
              {!isRenaming && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button disabled={busy}
                    type='button'
                    onClick={() => startCreateFile(node.path)}
                    className={`p-1 rounded transition-colors ${
                      isDarkMode
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-300 text-gray-500 hover:text-gray-700'
                    }`}
                    title="New file"
                  >
                    <Plus size={12} />
                  </button>
                  <button disabled={busy}
                    type='button'
                    onClick={() => startCreateFolder(node.path)}
                    className={`p-1 rounded transition-colors ${
                      isDarkMode
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-300 text-gray-500 hover:text-gray-700'
                    }`}
                    title="New folder"
                  >
                    <FolderPlus size={12} />
                  </button>
                </div>
              )}
            </div>
            
            {isExpanded && (
              <div className="mt-1">
                {/* Inline file creation input */}
                {isCreatingFileHere && renderCreateInput(node.path, depth, 'file')}
                
                {/* Render files in this folder */}
                {hasFiles && node.files.map((file) => {
                  const isRenamingFile = renamingItem?.path === file.path && renamingItem?.type === 'file';
                  
                  return (
                    <div
                      key={file.path}
                      draggable={!isRenamingFile && !busy}
                      onDragStart={event => {
                        draggedFile.current = file;
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData(FILE_DRAG_TYPE, file.path);
                        event.dataTransfer.setData('text/plain', file.path);
                      }}
                      onDragEnd={() => { draggedFile.current = null; setDropTarget(null); }}
                      className={`group cursor-pointer p-2 rounded text-sm transition-colors flex items-center justify-between ${
                        selectedFile?.path === file.path
                          ? isDarkMode
                            ? 'bg-blue-900 text-blue-200 border-l-2 border-blue-400'
                            : 'bg-blue-100 text-blue-800 border-l-2 border-blue-500'
                          : isDarkMode
                            ? 'hover:bg-gray-700 text-gray-300'
                            : 'hover:bg-gray-200 text-gray-700'
                      }`}
                      style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }}
                    >
                      {isRenamingFile ? (
                        <div className="flex items-center gap-2 flex-1">
                          <FileText size={14} className="flex-shrink-0" />
                          <input
                            ref={renameInputRef}
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={handleRenameKeyDown}
                            onBlur={handleRenameBlur}
                            className={`flex-1 px-2 py-1 text-sm border rounded ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                          <button disabled={busy} onClick={handleRenameSubmit} className="p-1 text-green-500 hover:bg-green-500 hover:text-white rounded">
                            <Check size={12} />
                          </button>
                          <button disabled={busy} onClick={handleRenameCancel} className="p-1 text-red-500 hover:bg-red-500 hover:text-white rounded">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 flex-1 min-w-0"
                          onClick={() => onFileSelect(file)}
                          onDoubleClick={() => handleDoubleClick(file, 'file')}
                        >
                          <FileText size={14} className="flex-shrink-0" />
                          <span className="truncate">
                            {file.name}
                            {file.modified && (
                              <span className="text-orange-500 ml-1">●</span>
                            )}
                          </span>
                        </div>
                      )}
                      
                      {!isRenamingFile && (
                        <button disabled={busy}
                          onClick={(e) => handleDeleteClick(e, file)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all flex-shrink-0 ${
                            isDarkMode
                              ? 'hover:bg-red-800 text-red-400'
                              : 'hover:bg-red-100 text-red-600'
                          }`}
                          title={`Delete ${file.name}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
                
                {/* Inline folder creation input */}
                {isCreatingFolderHere && renderCreateInput(node.path, depth, 'folder')}
                
                {/* Render subfolders */}
                {hasSubfolders && renderTree(node.children, depth + 1)}
                
                {/* Empty folder message */}
                {!hasFiles && !hasSubfolders && !isCreatingFileHere && !isCreatingFolderHere && (
                  <div className={`text-sm p-2 italic ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}
                    style={{ paddingLeft: `${(depth + 1) * 16 + 4}px` }}
                  >
                    Empty folder
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
      return null;
    });
  };

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'F2' && selectedFile && !renamingItem && !busy) {
        event.preventDefault();
        setRenamingItem({ ...selectedFile, type: 'file' });
        const name = selectedFile.name.replace(/\.md$/, '');
        setRenameValue(name);
        setOriginalName(name);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, renamingItem, busy]);

  const fileTree = useMemo(() => buildFileTree(files, folders), [files, folders]);

  return (
    <div className={`w-64 flex flex-col border-r h-full ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-100 border-gray-200'
    }`}>
      <div className={`p-4 border-b ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h2 className={`font-semibold flex items-center gap-2 ${
          isDarkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          <FileText size={18} />
          Vertex Editor
        </h2>
        <p className={`text-xs mt-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Static Site Generator
        </p>
        <div className="flex gap-1 mt-2">
          <button disabled={busy}
            onClick={() => startCreateFile('content')}
            className={`text-sm px-2 py-1 rounded transition-colors flex items-center gap-1 flex-1 justify-center ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Plus size={12} />
            File
          </button>
          <button disabled={busy}
            onClick={() => startCreateFolder('content')}
            className={`text-sm px-2 py-1 rounded transition-colors flex items-center gap-1 flex-1 justify-center ${
              isDarkMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <FolderPlus size={12} />
            Folder
          </button>
        </div>
        <div className={`text-xs mt-2 opacity-60 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Drag files onto folders • F2 to rename
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 group">
        {renderTree(fileTree)}
      </div>
      
      <div className={`p-3 border-t text-xs ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700 text-gray-400' 
          : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
        {selectedFile && (
          <label className="block mb-3">
            Move selected file to
            <select
              aria-label="Move selected file to"
              className={`w-full mt-1 p-1 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              value=""
              disabled={busy}
              onChange={async event => {
                const folder = event.target.value;
                if (folder && await onMoveFile(selectedFile, folder)) {
                  setExpandedFolders(previous => new Set([...previous, folder]));
                }
              }}
            >
              <option value="">Choose folder…</option>
              {(folders || []).filter(folder => folder.path !== parentPath(selectedFile.path)).map(folder => (
                <option key={folder.path} value={folder.path}>{folder.path}/</option>
              ))}
            </select>
          </label>
        )}
        <div className="text-center mb-2">
          <div className="font-medium text-blue-500">
            {(files && files.length) || 0}
          </div>
          <div className="text-xs">Content Files</div>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span>{(files && files.length) || 0} total</span>
          <span className="text-orange-500">
            {(files && files.filter(f => f.modified).length) || 0} unsaved
          </span>
        </div>
      </div>
    </div>
  );
}
