import React from "react";
import { ChatMessageType } from "../useChat";
import "./ChatHistory.scss"; // Import your CSS file
import ChatMessage from "./ChatMessage";

interface ChatHistoryProps {
    chatHistory: ChatMessageType[];
    isLoading: boolean;
    deleteMessage: (indexToDelete: number) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
    isLoading,
    chatHistory,
    deleteMessage,
}) => {
    return (
        <div className="chat-history-popup">
            <div className="chat-history-container">
                {[...chatHistory].concat(isLoading ? [{ user: "bot", message: "Typing..." }] : []).map((message, index) => (
                    <ChatMessage
                        key={index}
                        message={message}
                        index={index}
                        deleteMessage={deleteMessage}
                    />
                ))}
            </div>
        </div>
    );
};

export default ChatHistory;

