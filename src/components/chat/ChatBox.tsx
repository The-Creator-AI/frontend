import React, { useState } from 'react';
import './ChatBox.scss';

interface ChatBoxProps {
  onChatActivate: () => void;
  isActive: boolean;
  onSendMessage: (message: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onChatActivate, isActive, onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessageLocal = () => {
    if (message) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className={`chat-box ${isActive ? 'active' : ''}`} onClick={onChatActivate}>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleInputChange}
        />
        <button onClick={handleSendMessageLocal} disabled={!message}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;