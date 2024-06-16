import React from "react";
import useChat from "../useChat";
import "./ChatHistory.scss"; // Import your CSS file
import ChatMessage from "./ChatMessage";
import { v4 as uuidv4 } from 'uuid';

interface ChatHistoryProps {
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
}) => {
    const { chatHistory, isLoading } = useChat();
    return (
        <div className="chat-history-popup">
            <div className="chat-history-container">
                {[...chatHistory].concat(isLoading ? [{ user: "bot", message: "Typing...", uuid: uuidv4() }] : []).map((message, index) => (
                    <ChatMessage message={message}/>
                ))}
            </div>
        </div>
    );
};

export default ChatHistory;

