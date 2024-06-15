import { CloseOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import React, { useCallback, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./ChatHistoryPopup.scss"; // Import your CSS file
import CodeBlock from "./CodeBlock";
import { ChatMessageType } from "../useChat";
import ChatMessage from "./ChatMessage";

interface ChatHistoryPopupProps {
    chatHistory: ChatMessageType[];
    isLoading: boolean;
    deleteMessage: (indexToDelete: number) => void;
}

const ChatHistoryPopup: React.FC<ChatHistoryPopupProps> = ({
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

export default ChatHistoryPopup;

