import React from 'react';
import './ChatHistoryPopup.scss';
import { ChatMessage } from './useChat';
import ReactMarkdown from 'react-markdown';
import { message } from 'antd';

interface ChatHistoryPopupProps {
    chatHistory: ChatMessage[];
    isLoading: boolean;
}

const ChatHistoryPopup: React.FC<ChatHistoryPopupProps> = ({ isLoading, chatHistory }) => {
    return (
        <div className="chat-history-popup">
            <div className="chat-history-container">
                {[...chatHistory, ...isLoading ? [{
                    user: 'bot',
                    model: '',
                    message: 'Typing...'
                }] : []].map((message, index) => (
                    <div key={index} className={`message ${message.user}`}>
                        {message.user === 'bot' && (
                            message.model ? <span className="model-badge">{message.model}</span> : null
                        )}
                        <span className="user">{message.user}:</span>
                        <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatHistoryPopup;