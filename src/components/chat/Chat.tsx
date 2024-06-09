import React, { useEffect, useRef, useState } from 'react';
import ChatHistoryPopup from './ChatHistoryPopup';
import ChatBox from './ChatBox';
import { ChatMessage } from './useChat';
import './Chat.scss';

interface ChatProps {
    chatHistory: ChatMessage[];
    isLoading: boolean;
    deleteMessage: (indexToDelete: number) => void
    onSendMessage: (message: string, imageFiles?: File[]) => void;
}

const Chat: React.FC<ChatProps> = ({ chatHistory, isLoading, deleteMessage, onSendMessage }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isChatActive, setIsChatActive] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if clicking outside of chat container
            if (
                ref.current &&
                !ref.current.contains(event.target as Node)
            ) {
                setIsChatActive(false);
            } else {
                setIsChatActive(true)
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (previewImage) {
                    setPreviewImage(null);
                } else {
                    setIsChatActive(false);
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
    }, [previewImage, isChatActive]);

    return <>
        <div className="chat" ref={ref}>
            {isChatActive && <ChatHistoryPopup
                isLoading={isLoading}
                chatHistory={chatHistory}
                deleteMessage={deleteMessage} />}
            <ChatBox
                isActive={isChatActive}
                onSendMessage={onSendMessage}
                setPreviewImage={setPreviewImage}
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
