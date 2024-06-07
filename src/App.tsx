import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import './App.scss';
import FileExplorer from './components/file-explorer/FileExplorer';
import ChatBox from './components/chat/ChatBox';
import ChatHistoryPopup from './components/chat/ChatHistoryPopup';
import { useState } from 'react';
import useChat from './components/chat/useChat'; 

const queryClient = new QueryClient();

function App() {
  const [isChatActive, setIsChatActive] = useState(false);
  const { chatHistory, sendMessage } = useChat(); // Use the custom hook

  const handleChatActivate = () => {
    setIsChatActive(!isChatActive);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="App">
          <FileExplorer />
          {isChatActive && <ChatHistoryPopup chatHistory={chatHistory} />}
          <ChatBox onChatActivate={handleChatActivate} isActive={isChatActive} onSendMessage={sendMessage} /> 
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;