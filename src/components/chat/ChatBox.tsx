import React, { useState } from 'react';
import './ChatBox.scss';

interface ChatBoxProps {
  isActive: boolean;
  onSendMessage: (message: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ isActive, onSendMessage }) => {
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Check for Ctrl + Enter (on both Windows/Linux and macOS)
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { 
      event.preventDefault(); // Prevent default Enter behavior
      handleSendMessageLocal();
    }
  };

  return (
    <div className={`chat-box ${isActive ? 'active' : ''}`}>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSendMessageLocal} disabled={!message}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;