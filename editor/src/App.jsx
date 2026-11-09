import React, { useRef, useState } from "react";
import { useFileManager } from "./hooks/useFileManager";
import { useAppSettings } from "./hooks/useAppSettings";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import LoadingScreen from "./components/LoadingScreen";
import EditorLayout from "./components/EditorLayout";

export default function App() {
  const insertRef = useRef();
  
  // Custom hooks for state management
  const fileManager = useFileManager();
  const appSettings = useAppSettings();

  const [createRequest, setCreateRequest] = useState(0);

  // Handle text formatting for keyboard shortcuts
  const handleFormatText = (format) => {
    if (insertRef.current && insertRef.current.format) {
      insertRef.current.format(format);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: fileManager.handleSave,
    onSaveAll: fileManager.handleSaveAll,
    onCreateFile: () => {
      if (!appSettings.isSidebarVisible) appSettings.handleToggleSidebar();
      setCreateRequest(value => value + 1);
    },
    onTogglePreview: appSettings.handleTogglePreview,
    onToggleSidebar: appSettings.handleToggleSidebar || (() => {}),
    onFormatText: handleFormatText,
    onUndo: fileManager.handleUndo,
    onRedo: fileManager.handleRedo,
    disabled: fileManager.loading
  });

  // Show loading screen while files are being loaded
  if (fileManager.loading) {
    return <LoadingScreen isDarkMode={appSettings.isDarkMode} />;
  }

  return (
    <EditorLayout
      // File manager state
      files={fileManager.files}
      folders={fileManager.folders}
      busy={fileManager.busy}
      createRequest={createRequest}
      selectedFile={fileManager.selectedFile}
      error={fileManager.error}
      hasModifiedFiles={fileManager.hasModifiedFiles}
      
      // App settings state
      isPreviewMode={appSettings.isPreviewMode}
      isDarkMode={appSettings.isDarkMode}
      isSidebarVisible={appSettings.isSidebarVisible}
      
      // File manager actions
      onFileSelect={fileManager.handleFileSelect}
      onCreateFile={fileManager.handleCreateFile}
      onCreateFolder={fileManager.handleCreateFolder}
      onDeleteFile={fileManager.handleDeleteFile}
      onRenameFile={fileManager.handleRenameFile}
      onRenameFolder={fileManager.handleRenameFolder}
      onContentChange={fileManager.handleContentChange}
      onMoveFile={fileManager.handleMoveFile}
      onUndo={fileManager.handleUndo}
      onRedo={fileManager.handleRedo}
      onSave={fileManager.handleSave}
      onSaveAll={fileManager.handleSaveAll}
      onRefreshFiles={fileManager.handleRefreshFiles}
      onClearError={fileManager.clearError}
      
      // App settings actions
      onTogglePreview={appSettings.handleTogglePreview}
      onToggleDarkMode={appSettings.handleToggleDarkMode}
      onToggleSidebar={appSettings.handleToggleSidebar}
      
      // Editor specific props
      insertRef={insertRef}
    />
  );
}