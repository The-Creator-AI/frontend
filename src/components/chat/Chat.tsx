import React, { useEffect, useRef, useState } from 'react';
import ChatHistory from './chat-history/ChatHistory';
import ChatBox from './ChatBox';
import useChat from './useChat';
import './Chat.scss';

interface ChatProps {
}

const Chat: React.FC<ChatProps> = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { chatHistory, deleteMessage, isLoading } = useChat();

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

    return <>
        <div className="chat" ref={ref}>
            <ChatHistory />
            <ChatBox setPreviewImage={setPreviewImage}
            />
        </div>
        {previewImage && (
            <div className="image-preview-modal" onClick={() => setPreviewImage(null)}>
                <img src={previewImage} alt="Preview" className="preview-image" />
            </div>
        )}
    </>;
};

export default Chat;
