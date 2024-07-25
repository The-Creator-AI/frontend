import React, { useEffect, useRef, useState } from 'react';
import ChatHistory from './chat-history/ChatHistory';
import ChatBox from './ChatBox';
import './Chat.scss';
import { SaveOutlined } from '@ant-design/icons';
import { message } from 'antd';
import useStore from '../../../../../state/useStore';
import { codeChatStore$ } from '../../../store/code-chat.store';
import { saveChat } from '../../../store/code-chat-store.logic';

interface ChatProps {
}

const Chat: React.FC<ChatProps> = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { chat: { chatHistory } = { chatHistory: [] }, stage } = useStore(codeChatStore$);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (previewImage) {
            setPreviewImage(null);
        }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (previewImage) {
                setPreviewImage(null);
            }
        }
    }

    // Attach the event listeners
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup: Remove the listeners when the component unmounts
    return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
    };
}, [previewImage]);

  const handleSaveChat = () => {
    const newChatTitle = 'Chat ' + new Date().toUTCString(); // You can customize the chat title
    const chatDescription = 'This chat is about...'; // You can customize the chat description
    saveChat({
      id: stage.type === 'chat' || stage.type === 'plan' ? stage.activeChatId : undefined,
      chat_history: chatHistory,
      title: stage.type === 'chat' || stage.type === 'plan' ? (stage.title || newChatTitle) : newChatTitle,
      description: chatDescription,
    }).then(() => {
      message.success('Chat saved successfully!');
    }).catch((error) => {
      console.error('Error saving chat:', error);
      message.error('Failed to save chat.');
    });
  };

  return <>
    <div className="chat" ref={ref}>
      <ChatHistory />
      <ChatBox setPreviewImage={setPreviewImage}
      />
      <button onClick={handleSaveChat} title="Save Chat" className="save-chat-button">
        <SaveOutlined />
      </button>
    </div>
    {previewImage && (
      <div className="image-preview-modal" onClick={() => setPreviewImage(null)}>
        <img src={previewImage} alt="Preview" className="preview-image" />
      </div>
    )}
  </>;
};

export default Chat;
