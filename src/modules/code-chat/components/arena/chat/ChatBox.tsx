import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.scss'; // Import your updated CSS
import { CloseOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import AgentSelector from './AgentSelector';
import useStore from '../../../../../state/useStore';
import { codeChatStore$ } from '../../../store/code-chat.store';
import useChat from './useChat';
import { saveChat, updateChatHistory, updateStage } from '../../../store/code-chat-store.logic';
import { message as Message } from 'antd';

interface ChatBoxProps {
  setPreviewImage: React.Dispatch<React.SetStateAction<string | null>>
}

const ChatBox: React.FC<ChatBoxProps> = ({ setPreviewImage }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pastedImages, setPastedImages] = useState<File[]>([]);
  const { selectedAgent, currentPath, selectedFiles, stage } = useStore(codeChatStore$);
  const { sendMessage, handleTokenCount, tokenCount, chatHistory, isLoading } = useChat();
  const [isLoadingTokenCount, setIsLoadingTokenCount] = useState(false);
  const sendDisabled = !message || isLoading;

  useEffect(() => {
    (async () => {
      setIsLoadingTokenCount(true);
      await handleTokenCount({
        agentInstruction: selectedAgent?.systemInstructions,
        agentName: selectedAgent?.name,
        message,
        imageFiles: pastedImages,
        selectedFiles: selectedFiles?.map(filePath => `${currentPath}/${filePath}`),
      });
      setIsLoadingTokenCount(false);
    })();
  }, [message, selectedFiles, chatHistory]);

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
    saveChat({
      id: stage.type === 'chat' || stage.type === 'plan' ? stage.activeChatId : undefined,
      chat_history: chatHistory,
      title: stage.type === 'chat' || stage.type === 'plan' ? (stage.title || newChatTitle) : newChatTitle,
      description: chatDescription,
    }).then(() => {
      Message.success('Chat saved successfully!');
    }).catch((error) => {
      console.error('Error saving chat:', error);
      Message.error('Failed to save chat.');
    });
  };

  const handleNewChat = () => {
    updateStage({ type: 'chat', activeChatId: undefined });
    updateChatHistory([]);
    setMessage('');
    setPastedImages([]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setPastedImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleImageClick = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setPastedImages(prevImages => [...prevImages, file]);
          }
        }
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessageLocal = () => {
    if ((message || pastedImages.length > 0) && !sendDisabled) {
      sendMessage({
        agentInstruction: selectedAgent?.systemInstructions,
        agentName: selectedAgent?.name,
        message,
        imageFiles: pastedImages,
        selectedFiles: selectedFiles.map(filePath => `${currentPath}/${filePath}`),
      });
      setMessage('');
      setPastedImages([]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl + Enter or Cmd + Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSendMessageLocal();
    }
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
      <div className="chat-input">
        <label htmlFor="chat-textarea" className="visually-hidden">
          Type your message
        </label>
        <textarea
          id="chat-textarea" // Add ID for label association
          ref={textareaRef} // Add ref for auto-resize
          placeholder="Type your message..."
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
        <button onClick={handleSendMessageLocal} disabled={sendDisabled} title={sendDisabled ? 'Please enter a message!' : ''}>
          {isLoading ? 'Bot typing...' : 'Send'}
        </button>
      </div>
      {pastedImages.length > 0 && (
        <div className="image-previews">
          {pastedImages.map((image, index) => (
            <div key={index} className="image-preview-wrapper">
              <div
                className="image-preview"
                onClick={() => handleImageClick(URL.createObjectURL(image))}
                style={{ backgroundImage: `url(${URL.createObjectURL(image)})` }} // Set background image
              >
                <CloseOutlined
                  className="close-icon"
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent click event from bubbling to parent
                    handleRemoveImage(index);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
