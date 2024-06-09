// src/App.tsx
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import { useSearchParams } from 'react-router-dom';
import './App.scss';
import Chat from './components/chat/Chat';
import useChat from './components/chat/useChat';
import FileExplorer from './components/file-explorer/FileExplorer';
import { appStore$, updateCurrentPath, updateSelectedFiles } from './state/app.store';
import useStore from './state/useStore';

const queryClient = new QueryClient();

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPath, selectedFiles } = useStore(appStore$);

  useEffect(() => {
    const paramsObject = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...paramsObject, path: currentPath });
  }, [currentPath]);

  // Load selected files from localStorage on component mount and path change
  useEffect(() => {
    const storedFiles = localStorage.getItem(`selectedFiles-${currentPath}`);
    if (storedFiles) {
      updateSelectedFiles(JSON.parse(storedFiles));
    }
  }, [currentPath]);

  // Save selected files to localStorage whenever it changes
  useEffect(() => {
    if (currentPath && selectedFiles.length) {
      localStorage.setItem(`selectedFiles-${currentPath}`, JSON.stringify(selectedFiles));
    }
  }, [selectedFiles]);

  const { isLoading, chatHistory, sendMessage, deleteMessage } = useChat();

  const handleSendMessage = (message: string, imageFiles?: File[]) => {
    sendMessage(message, selectedFiles.map(f => `${currentPath}/${f.filePath}`), imageFiles);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="App">
          <FileExplorer />
          <Chat
            isLoading={isLoading}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            deleteMessage={deleteMessage}
          />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
