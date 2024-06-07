import React from 'react';
import './ChatHistoryPopup.scss';
import { ChatMessage } from './useChat';
import ReactMarkdown from 'react-markdown';
import { CloseOutlined } from '@ant-design/icons';

interface ChatHistoryPopupProps {
    chatHistory: ChatMessage[];
    isLoading: boolean;
    deleteMessage: (indexToDelete: number) => void
}

const ChatHistoryPopup: React.FC<ChatHistoryPopupProps> = ({ isLoading, chatHistory, deleteMessage }) => {
    return (
        <div className="chat-history-popup">
            <div className="chat-history-container">
                {[...chatHistory, ...isLoading ? [{
                    user: 'bot',
                    model: '',
                    message: 'Typing...'
                }] : []].map((message, index) => (
                    <div key={index} className={`message ${message.user}`}>
                        <div className="message-content"> {/* Wrap content and delete icon */}
                            {message.user === 'bot' && (
                                message.model ? <span className="model-badge">{message.model}</span> : null
                            )}
                            <span className="user">{message.user}:</span>
                            <ReactMarkdown>{message.message}</ReactMarkdown>
                        </div>
                        <CloseOutlined 
                            className="delete-icon" 
                            onClick={() => deleteMessage(index)} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatHistoryPopup;