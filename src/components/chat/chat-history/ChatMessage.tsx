import { CloseOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessageType } from "../useChat";
import "./ChatHistoryPopup.scss"; // Import your CSS file
import CodeBlock from "./CodeBlock";


interface ChatMessageProps {
    message: ChatMessageType;
    index: number;
    deleteMessage: (indexToDelete: number) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    index,
    deleteMessage,
}) => {
    const messageRef = useRef<HTMLDivElement>(null);
    const [showCollapse, setShowCollapse] = useState(false);
    const [isCollapsed, setCollapsed] = useState(false);

    useEffect(() => {
        // use ResizeObserver to detect changes in the height of the message
        const resizeObserver = new ResizeObserver(() => {
            if (messageRef.current) {
                if (messageRef.current.clientHeight >= 250) {
                    setShowCollapse(true);
                }
            }
        });

        if (messageRef.current) {
            resizeObserver.observe(messageRef.current);
        }
    }, []);


    return (
        <div
            key={index}
            className={`message ${message.user} ${isCollapsed ? "collapsed" : ""
                }`}
            ref={messageRef}
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
            {showCollapse && (
                <button
                    onClick={() => setCollapsed(!isCollapsed)}
                    className="expand-collapse-button"
                >
                    {isCollapsed ? (
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
};

export default ChatMessage;
