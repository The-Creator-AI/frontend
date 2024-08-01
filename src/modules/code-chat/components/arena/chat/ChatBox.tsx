import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { message as Message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import useStore from '../../../../../state/useStore';
import { clearChats, saveChat, updateChatHistory, updateStage } from '../../../store/code-chat.logic';
import { codeChatStore$, getChatIdForFirstChat } from '../../../store/code-chat.store';
import AgentSelector from './AgentSelector';
import './ChatBox.scss';
import ChatInput from './ChatInput';
import useChat from './useChat';

interface ChatBoxProps {
  setPreviewImage: React.Dispatch<React.SetStateAction<string | null>>
}

const ChatBox: React.FC<ChatBoxProps> = ({ setPreviewImage }) => {
  const { selectedAgent, currentPath, selectedFiles, stage } = useStore(codeChatStore$);
  const { handleTokenCount, tokenCount, chatHistory } = useChat();
  const [isLoadingTokenCount, setIsLoadingTokenCount] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pastedImages, setPastedImages] = useState<File[]>([]);

  useEffect(() => {
    (async () => {
      setIsLoadingTokenCount(true);
      await handleTokenCount({
        agentInstruction: selectedAgent?.systemInstructions,
        agentName: selectedAgent?.name,
        message: '',
        imageFiles: [], // Handle image files when the backend is ready for it
        selectedFiles: selectedFiles?.map(filePath => `${currentPath}/${filePath}`),
      });
      setIsLoadingTokenCount(false);
    })();
  }, [selectedFiles, chatHistory]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height before calculating
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  const handleSaveChat = () => {
    const newChatTitle = 'Chat ' + new Date().toUTCString(); // You can customize the chat title
    const chatDescription = 'This chat is about...'; // You can customize the chat description
    console.log({ stage });
    saveChat({
      id: (stage?.type === 'chat' || stage?.type === 'plan') && stage.activeChatId ? stage.activeChatId : undefined,
      chat_history: chatHistory,
      title: (stage?.type === 'chat' || stage?.type === 'plan') && stage.activeChatId ? (stage.title || newChatTitle) : newChatTitle,
      description: chatDescription,
    }).then(() => {
      Message.success('Chat saved successfully!');
    }).catch((error) => {
      console.error('Error saving chat:', error);
      Message.error('Failed to save chat.');
    });
  };

  const handleNewChat = () => {
    updateStage({
      stage: { type: 'chat', activeChatId: undefined },
      breadcrumb: {
        items: [{
          label: 'Chat',
          href: '/chat',
          disabled: true
        }, {
          label: 'New Chat',
          href: '/new-chat'
        }],
      },
  });
    clearChats()
  };

  return (
    <div className={`chat-box`}>
      <div className="chat-box-header">
        <div className="chat-box-header-left">
          <AgentSelector />
          {/* <div className="token-count"> */}
          <div className={`token-count ${isLoadingTokenCount ? 'loading' : ''}`}
            style={{
              color: `rgb(${(tokenCount / 1000) * 2.55}, ${(100 - (tokenCount / 1000)) * 2.55}, 0)`,
            }}
          >
            {tokenCount ? `Tokens: ${(tokenCount / 1024).toFixed(2)} k` : null}
          </div>
        </div>
        <div className="chat-box-header-right">
          <button onClick={handleNewChat} title="New Chat" className="new-chat-button">
            <PlusOutlined />
          </button>
          <button onClick={handleSaveChat} title="Save Chat" className="save-chat-button">
            <SaveOutlined />
          </button>
        </div>
      </div>
      <ChatInput setPreviewImage={setPreviewImage}/>
    </div>
  );
};

export default ChatBox;

