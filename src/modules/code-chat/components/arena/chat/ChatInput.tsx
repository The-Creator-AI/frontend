import { CloseOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import './ChatInput.scss';
import useChat from './useChat';
import useStore from '../../../../../state/useStore';
import { codeChatStore$, getChatIdForFirstChat } from '../../../store/code-chat.store';

interface ChatInputProps {
    setPreviewImage: React.Dispatch<React.SetStateAction<string | null>>
}

const ChatInput: React.FC<ChatInputProps> = ({ setPreviewImage }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [pastedImages, setPastedImages] = useState<File[]>([]);
    const { sendMessage, isLoading } = useChat();
    const { selectedAgent, currentPath, selectedFiles, stage } = useStore(codeChatStore$);

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

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Check for Ctrl + Enter or Cmd + Enter
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            handleSendMessageLocal();
        }
    };

    const handleSendMessageLocal = () => {
        if ((message || pastedImages.length > 0) && !isLoading) {
          sendMessage({
            chatId: getChatIdForFirstChat(),
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
    

    return (
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
            <button onClick={handleSendMessageLocal} disabled={!message || isLoading} title={!message || isLoading ? 'Please enter a message!' : ''}>
            {isLoading ? 'Bot typing...' : 'Send'}
            </button>
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

export default ChatInput;

