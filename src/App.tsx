import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import './App.scss';
import FileExplorer from './components/file-explorer/FileExplorer';
import ChatBox from './components/chat/ChatBox';
import ChatHistoryPopup from './components/chat/ChatHistoryPopup';
import { useEffect, useState } from 'react';
import useChat, { ChatMessage } from './components/chat/useChat';
import { NodeId } from 'react-accessible-treeview';
import { useSearchParams } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPath, setCurrentPath] = useState(searchParams.get('path') || '');
  const [selectedFiles, setSelectedFiles] = useState<{
    nodeId: NodeId;
    filePath: string;
  }[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const { isLoading, chatHistory, sendMessage, deleteMessage } = useChat();

  const handleChatActivate = () => {
    setIsChatActive(!isChatActive);
  };

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
          {isChatActive && <ChatHistoryPopup
            isLoading={isLoading}
            chatHistory={chatHistory}
            deleteMessage={deleteMessage} />}
          <ChatBox
            onChatActivate={handleChatActivate}
            isActive={isChatActive}
            onSendMessage={handleSendMessage}
          />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;