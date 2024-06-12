// File path: src/components/chat/ChatHistoryPopup.tsx

import { CloseOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./ChatHistoryPopup.scss"; // Import your CSS file
import CodeBlock from "./CodeBlock";
import { ChatMessage } from "./useChat";

interface ChatHistoryPopupProps {
    chatHistory: ChatMessage[];
    isLoading: boolean;
    deleteMessage: (indexToDelete: number) => void;
}

const ChatHistoryPopup: React.FC<ChatHistoryPopupProps> = ({
    isLoading,
    chatHistory,
    deleteMessage,
}) => {
    const [collapsedMessages, setCollapsedMessages] = useState<{
        [key: number]: boolean;
    }>({});
    const messageRefs = useRef<HTMLDivElement[]>([]);

    const toggleMessageCollapse = (index: number) => {
        setCollapsedMessages((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    return (
        <div className="chat-history-popup">
            <div className="chat-history-container">
                {[...chatHistory]
                    .concat(isLoading ? [{ user: "bot", message: "Typing..." }] : [])
                    .map((message, index) => {
                        const messageRef = messageRefs.current[index];
                        const shouldShowCollapseButton =
                            messageRef && messageRef.clientHeight >= 150;

                        return (
                            <div
                                key={index}
                                className={`message ${message.user} ${collapsedMessages[index] ? "collapsed" : ""
                                    }`}
                                ref={(el) => (messageRefs.current[index] = el as any)}
                            >
                                <div className="message-content">
                                    {message.user === "bot" && (
                                        message.model ? (
                                            <span
                                                className="model-badge"
                                                aria-label={message.model}
                                            >
                                                {message.model}
                                            </span>
                                        ) : null
                                    )}
                                    {message.user === "instructor" ? (
                                        <span
                                            className="agent-badge"
                                            aria-label={message.message}
                                        >
                                            {message.agentName}
                                        </span>
                                    ) : (
                                        <div className="markdown-container">
                                            <ReactMarkdown
                                                components={{
                                                    code: CodeBlock as any,
                                                }}
                                            >
                                                {message.message}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                                {shouldShowCollapseButton && (
                                    <button
                                        onClick={() => toggleMessageCollapse(index)}
                                        className="expand-collapse-button"
                                    >
                                        {collapsedMessages[index] ? (
                                            <DownOutlined />
                                        ) : (
                                            <UpOutlined />
                                        )}
                                    </button>
                                )}
                                <CloseOutlined
                                    className="delete-icon"
                                    onClick={() => deleteMessage(index)}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default ChatHistoryPopup;

