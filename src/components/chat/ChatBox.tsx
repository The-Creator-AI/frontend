import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.scss'; // Import your updated CSS
import { CloseOutlined } from '@ant-design/icons';
import AgentSelector from './AgentSelector';
import useStore from '../../state/useStore';
import { appStore$ } from '../../state/app.store';
import useChat from './useChat';

interface ChatBoxProps {
  setPreviewImage: React.Dispatch<React.SetStateAction<string | null>>
}

const ChatBox: React.FC<ChatBoxProps> = ({ setPreviewImage }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pastedImages, setPastedImages] = useState<File[]>([]);
  const { selectedAgent, currentPath, selectedFiles } = useStore(appStore$);
  const { sendMessage, handleTokenCount, tokenCount } = useChat();

  useEffect(() => {
    handleTokenCount({
      agentInstruction: selectedAgent?.systemInstructions,
      agentName: selectedAgent?.name,
      message,
      imageFiles: pastedImages,
      selectedFiles: selectedFiles.map(f => `${currentPath}/${f.filePath}`),
    });
  }, [message, selectedFiles]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height before calculating
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

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
    if (message || pastedImages.length > 0) {
      sendMessage({
        agentInstruction: selectedAgent?.systemInstructions,
        agentName: selectedAgent?.name,
        message,
        imageFiles: pastedImages,
        selectedFiles: selectedFiles.map(f => `${currentPath}/${f.filePath}`),
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
        <AgentSelector />
        <div className="token-count">
        {tokenCount ? `Tokens: ${(tokenCount / 1024).toFixed(2)} k` : null}
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
        <button onClick={handleSendMessageLocal} disabled={!message}>
          Send
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
