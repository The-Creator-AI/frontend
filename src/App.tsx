import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import { useEffect, useState } from 'react';
import { NodeId } from 'react-accessible-treeview';
import { useSearchParams } from 'react-router-dom';
import './App.scss';
import Chat from './components/chat/Chat';
import useChat from './components/chat/useChat';
import FileExplorer from './components/file-explorer/FileExplorer';

const queryClient = new QueryClient();

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPath, setCurrentPath] = useState(searchParams.get('path') || '');
  const [selectedFiles, setSelectedFiles] = useState<{
    nodeId: NodeId;
    filePath: string;
  }[]>([]);

  // Load selected files from localStorage on component mount and path change
  useEffect(() => {
    const storedFiles = localStorage.getItem(`selectedFiles-${currentPath}`);
    if (storedFiles) {
      setSelectedFiles(JSON.parse(storedFiles));
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

  useEffect(() => {
    setSearchParams({ path: currentPath });
  }, [currentPath, setSearchParams]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="App">
          <FileExplorer
            currentPath={currentPath}
            setCurrentPath={setCurrentPath}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
          />
          <Chat isLoading={isLoading}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            deleteMessage={deleteMessage} />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
