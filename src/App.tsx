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
  const { isLoading, chatHistory, sendMessage, deleteMessage } = useChat();

  const handleSendMessage = (message: string) => {
    sendMessage(message, selectedFiles.map(f => `${currentPath}/${f.filePath}`));
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