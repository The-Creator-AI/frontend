import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.scss'; // Import your updated CSS

interface ChatBoxProps {
  isActive: boolean;
  onSendMessage: (message: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ isActive, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null); 

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height before calculating
      textarea.style.height = `${textarea.scrollHeight}px`; 
    }
  }, [message]); 

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessageLocal = () => {
    if (message) {
      onSendMessage(message);
      setMessage('');
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
    <div className={`chat-box ${isActive ? 'active' : ''}`}>
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
        />
        <button onClick={handleSendMessageLocal} disabled={!message}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
