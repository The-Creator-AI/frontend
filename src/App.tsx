import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import './App.scss';
import FileExplorer from './components/file-explorer/FileExplorer';
import ChatBox from './components/chat/ChatBox';
import ChatHistoryPopup from './components/chat/ChatHistoryPopup';
import { useState } from 'react';
import useChat, { ChatMessage } from './components/chat/useChat';
import { NodeId } from 'react-accessible-treeview';

const queryClient = new QueryClient();

function App() {
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{
    nodeId: NodeId;
    filePath: string;
  }[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const { chatHistory, sendMessage } = useChat();

  const handleChatActivate = () => {
    setIsChatActive(!isChatActive);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message, selectedFiles.map(f => `${currentPath}/${f.filePath}`));
  };

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
          {isChatActive && <ChatHistoryPopup chatHistory={chatHistory} />}
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