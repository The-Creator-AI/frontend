import { CloseOutlined, DownOutlined, UpOutlined, SaveOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import useChat from "../useChat";
import { ChatMessageType } from '@The-Creator-AI/fe-be-common/dist/types';
import "./ChatHistory.scss";
import CodeBlock from "./CodeBlock";
import { FaUser, FaUserAstronaut } from "react-icons/fa";
import { saveCodeToFile } from "../../../../store/code-chat-store.logic";
import { getCurrentPath } from "../../../../store/code-chat.store";

interface ChatMessageProps {
    message: ChatMessageType;
}

interface ParsedMessage {
    filePath: string | null;
    code: string | null;
    remainingMessage: string;
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
        const parseMessage = (msg: string): ParsedMessage => {
            const result: ParsedMessage = {
                filePath: null,
                code: null,
                remainingMessage: msg
            };

            // Try to parse file_path from JSON
            const filePathMatch = msg.match(/```json\s*(\{[^}]*\})\s*```/);
            if (filePathMatch) {
                try {
                    const jsonObj = JSON.parse(filePathMatch[1]);
                    if (jsonObj.file_path) {
                        result.filePath = jsonObj.file_path;
                        result.remainingMessage = msg.replace(filePathMatch[0], '').trim();
                    }
                } catch (e) {
                    console.error("Failed to parse JSON:", e);
                }
            }

            // Try to extract code block
            const codeMatch = result.remainingMessage.match(/```(?:\w+\n)?(.+?)```/s);
            if (codeMatch?.[1]) {
                result.code = codeMatch[1];
                result.remainingMessage = result.remainingMessage.replace(codeMatch[0], '').trim();
            }

            return result;
        };

        setParsedMessage(parseMessage(message.message));
    }, [message.message]);

    useEffect(() => {
        // ... (ResizeObserver logic remains the same)
    }, []);

    const handleSaveCode = async () => {
        if (parsedMessage.filePath && parsedMessage.code) {
            try {
                await saveCodeToFile(`${getCurrentPath()}/${parsedMessage.filePath}`, parsedMessage.code);
            } catch (error) {
                console.error('Failed to save code:', error);
                alert('Failed to save code. Please try again.');
            }
        }
    };

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
                                <span className='save-icon' onClick={handleSaveCode}>
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
                                        <CodeBlock {...props as any} onSave={handleSaveCode} />
                                    ) as any,
                                }}
                            >
                                {parsedMessage.code}
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