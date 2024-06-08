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
                // Deactivate the chat only if clicked outside
                // Assuming you have a function like 'deactivateChat'
                // to handle deactivating the chat
                setIsChatActive(false);
            } else {
                setIsChatActive(true)
            }
        };

        // Attach the event listener
        document.addEventListener('click', handleClickOutside);

        // Cleanup: Remove the listener when the component unmounts
        return () => {
            document.removeEventListener('click', handleClickOutside);
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