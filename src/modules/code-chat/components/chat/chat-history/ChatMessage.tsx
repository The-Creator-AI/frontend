import { CloseOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import useChat, { ChatMessageType } from "../useChat";
import "./ChatHistory.scss"; // Import your CSS file
import CodeBlock from "./CodeBlock";


interface ChatMessageProps {
    message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
}) => {
    const messageRef = useRef<HTMLDivElement>(null);
    const { deleteMessage, setMessageCollapsed } =  useChat();
    const [showCollapse, setShowCollapse] = useState(false);

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
    }, [message]);


    return (
        <div
            key={message.uuid}
            className={`message ${message.user} ${message.isCollapsed ? "collapsed" : ""
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
            {(showCollapse || message.isCollapsed) && (
                <button
                    onClick={() => setMessageCollapsed(message.uuid, !message.isCollapsed)}
                    className="expand-collapse-button"
                >
                    {message.isCollapsed ? (
                        <DownOutlined />
                    ) : (
                        <UpOutlined />
                    )}
                </button>
            )}
            <CloseOutlined
                className="delete-icon"
                onClick={() => deleteMessage(message.uuid)}
            />
        </div>
    );
};

export default ChatMessage;
