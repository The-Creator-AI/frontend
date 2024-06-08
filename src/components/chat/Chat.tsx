import React, { useEffect, useRef, useState } from 'react';
import ChatHistoryPopup from './ChatHistoryPopup';
import ChatBox from './ChatBox';
import { ChatMessage } from './useChat';

interface ChatProps {
    chatHistory: ChatMessage[];
    isLoading: boolean;
    deleteMessage: (indexToDelete: number) => void
    onSendMessage: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ chatHistory, isLoading, deleteMessage, onSendMessage }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isChatActive, setIsChatActive] = useState(false);

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
                setIsChatActive(false);
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
    }, []);

    return <div ref={ref}>
        {isChatActive && <ChatHistoryPopup
            isLoading={isLoading}
            chatHistory={chatHistory}
            deleteMessage={deleteMessage} />}
        <ChatBox
            isActive={isChatActive}
            onSendMessage={onSendMessage}
        />
    </div>;
};

export default Chat;
