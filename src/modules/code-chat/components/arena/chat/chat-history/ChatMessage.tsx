import { CloseOutlined, DownOutlined, UpOutlined, SaveOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import useChat from "../useChat";
import { ChatMessageType } from '@The-Creator-AI/fe-be-common/dist/types';
import "./ChatHistory.scss";
import CodeBlock from "./CodeBlock";
import { FaUser, FaUserAstronaut } from "react-icons/fa";
import { saveCodeToFile, saveCodeToFileFromDeveloperResponse } from "../../../../store/code-chat-store.logic";
import { getCurrentPath } from "../../../../store/code-chat.store";
import { ParsedMessage, parseDeveloperResponse } from "./code-plan/CodePlanDisplay.utils";

interface ChatMessageProps {
    message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
}) => {
    const messageRef = useRef<HTMLDivElement>(null);
    const { deleteMessage, setMessageCollapsed } = useChat();
    const [showCollapse, setShowCollapse] = useState(false);
    const [parsedMessage, setParsedMessage] = useState<ParsedMessage>({
        filePath: null,
        code: null,
        remainingMessage: message.message
    });

    useEffect(() => {
        setParsedMessage(parseDeveloperResponse(message.message));
    }, [message.message]);

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
            className={`message ${message.user} ${message.isCollapsed ? "collapsed" : ""}`}
            ref={messageRef}
        >
            <div className="sender-badge">
                {message.user === "user" && <FaUser />}
                {message.user === "bot" && <FaUserAstronaut />}
            </div>
            <div className="message-content">
                {message.user === "bot" && message.model && (
                    <span className="model-badge" aria-label={message.model}>
                        {message.model}
                    </span>
                )}
                {message.user === "instructor" ? (
                    <span className="agent-badge" aria-label={message.message}>
                        {message.agentName}
                    </span>
                ) : (
                    <div className="markdown-container">
                        {parsedMessage.filePath && (
                            <div className="file-path">
                                {parsedMessage.filePath}
                                <span className='save-icon' onClick={() => saveCodeToFileFromDeveloperResponse(parsedMessage)}>
                                    <SaveOutlined style={{
                                        fontSize: '22px',
                                    }} title="Save code to file"/>
                                </span>
                            </div>
                        )}
                        {parsedMessage.code && (
                            <ReactMarkdown
                                components={{
                                    code: ({ ...props }) => (
                                        <CodeBlock {...props as any} onSave={() => saveCodeToFileFromDeveloperResponse(parsedMessage)} />
                                    ) as any,
                                }}
                            >
                                 {message.message}
                            </ReactMarkdown>
                        )}
                        <ReactMarkdown components={{ code: CodeBlock as any }}>
                            {parsedMessage.remainingMessage}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
            {(showCollapse || message.isCollapsed) && (
                <button
                    onClick={() => setMessageCollapsed(message.uuid, !message.isCollapsed)}
                    className="expand-collapse-button"
                >
                    {message.isCollapsed ? <DownOutlined /> : <UpOutlined />}
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