
import React from 'react';
import './ChatHistoryPopup.scss';

interface ChatHistoryPopupProps {
  chatHistory: { user: string; message: string }[]; // You'll need to pass the chat history data
}

const ChatHistoryPopup: React.FC<ChatHistoryPopupProps> = ({ chatHistory }) => {
  return (
    <div className="chat-history-popup">
      <div className="chat-history-container">
        {chatHistory.map((message, index) => (
          <div key={index} className={`message ${message.user}`}>
            <span className="user">{message.user}:</span> {message.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistoryPopup;