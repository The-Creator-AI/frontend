import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.scss'; // Import your updated CSS

interface ChatBoxProps {
  isActive: boolean;
  onSendMessage: (message: string, imageFiles?: File[]) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ isActive, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null); 
  const [pastedImages, setPastedImages] = useState<File[]>([]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height before calculating
      textarea.style.height = `${textarea.scrollHeight}px`; 
    }
  }, [message]); 

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
    if (message || pastedImages.length > 0) {
      onSendMessage(message, pastedImages);
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
          onPaste={handlePaste} 
        />
        <button onClick={handleSendMessageLocal} disabled={!message}>
          Send
        </button>
      </div>
      {pastedImages.length > 0 && (
        <div className="image-previews">
          {pastedImages.map((image, index) => (
            <div key={index} className="image-preview">
              <img src={URL.createObjectURL(image)} alt="Pasted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
