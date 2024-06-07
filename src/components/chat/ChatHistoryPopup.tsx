import React from 'react';
import './ChatHistoryPopup.scss';
import { ChatMessage } from './useChat';

interface ChatHistoryPopupProps {
  chatHistory: ChatMessage[]; 
}

const ChatHistoryPopup: React.FC<ChatHistoryPopupProps> = ({ chatHistory }) => {
  return (
    <div className="chat-history-popup">
      <div className="chat-history-container">
        {chatHistory.map((message, index) => (
          <div key={index} className={`message ${message.user}`}>
            {message.user === 'bot' && (
              <span className="model-badge">{message.model}</span> 
            )}
            <span className="user">{message.user}:</span> {message.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistoryPopup;