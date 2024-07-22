import React, { useEffect, useRef, useState } from "react";
import useChat from "../useChat";
import "./ChatHistory.scss"; // Import your CSS file
import ChatMessage from "./ChatMessage";
import { v4 as uuidv4 } from 'uuid';

interface ChatHistoryProps {
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
}) => {
    const { chatHistory } = useChat();
    const isScrollAtBottom = useRef(false);
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.onscroll = () => {
                if (chatHistoryRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } = chatHistoryRef.current;
                    const foundScrollAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
                    isScrollAtBottom.current = foundScrollAtBottom;
                }
            }
        }
    }, []);

    useEffect(() => {
        // if scroll was already at the bottom, scroll to the bottom
        if (chatHistoryRef.current && isScrollAtBottom.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <div className="chat-history-popup" ref={chatHistoryRef}>
            <div className="chat-history-container">
                {[...chatHistory]
                // .concat(isLoading ? [{ user: "bot", message: "Typing...", uuid: uuidv4() }] : [])
                .map((message, index) => (
                    <ChatMessage message={message}/>
                ))}
            </div>
        </div>
    );
};

export default ChatHistory;

