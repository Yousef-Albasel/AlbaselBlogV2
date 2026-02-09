import React, { useState, useRef, useCallback } from 'react';
import MarkdownEditor from './MarkdownEditor.jsx';
import PreviewPane from './MarkdownPreview.jsx';
import Toolbar from './Toolbar.jsx';

const MainEditor = ({ 
  selectedFile,
  isPreviewMode,
  isDarkMode,
  isSidebarVisible,
  hasModifiedFiles,
  onContentChange,
  onInsert,
  onSave,
  onSaveAll,
  onTogglePreview,
  onToggleDarkMode,
  onToggleSidebar,
  insertRef
}) => {
  // Resizable pane state (percentage for left pane)
  const [leftPaneWidth, setLeftPaneWidth] = useState(50);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Handle text formatting
  const handleFormatText = (format) => {
    if (insertRef.current && insertRef.current.format) {
      insertRef.current.format(format);
    }
  };

  // Handle regular insert (for non-formatting buttons like Image)
  const handleInsert = (text) => {
    if (insertRef.current && insertRef.current.insert) {
      insertRef.current.insert(text);
    }
  };

  // Resizer drag handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Clamp between 20% and 80%
      setLeftPaneWidth(Math.min(80, Math.max(20, newWidth)));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <Toolbar 
        onInsert={handleInsert}
        onFormatText={handleFormatText}
        onSave={onSave}
        onSaveAll={onSaveAll}
        isPreviewMode={isPreviewMode}
        onTogglePreview={onTogglePreview}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={onToggleSidebar}
        selectedFile={selectedFile}
        hasModifiedFiles={hasModifiedFiles}
      />
      
      <div ref={containerRef} className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        {!isPreviewMode ? (
          <>
            {/* Editor Pane */}
            <div 
              className="min-w-0 overflow-hidden" 
              style={{ width: `${leftPaneWidth}%`, flexShrink: 0 }}
            >
              <MarkdownEditor
                value={selectedFile?.content}
                onChange={onContentChange}
                onInsert={insertRef}
                isDarkMode={isDarkMode}
              />
            </div>
            
            {/* Resizable Divider */}
            <div
              className={`w-1 cursor-col-resize flex-shrink-0 hover:w-1.5 transition-all group ${
                isDarkMode ? 'bg-gray-700 hover:bg-blue-500' : 'bg-gray-300 hover:bg-blue-400'
              }`}
              onMouseDown={handleMouseDown}
              title="Drag to resize"
            >
              <div className={`h-full w-full ${isDraggingRef.current ? 'bg-blue-500' : ''}`} />
            </div>
            
            {/* Preview Pane */}
            <div 
              className={`min-w-0 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{ width: `${100 - leftPaneWidth}%`, flexShrink: 0 }}
            >
              <PreviewPane 
                markdown={selectedFile?.content} 
                isDarkMode={isDarkMode} 
              />
            </div>
          </>
        ) : (
          <div className={`flex-1 min-w-0 overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <PreviewPane 
              markdown={selectedFile?.content} 
              isDarkMode={isDarkMode} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainEditor;
