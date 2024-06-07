import { useState } from 'react';
import axios from 'axios';
import config from '../../config';

export interface ChatMessage {
  user: 'user' | 'bot';
  message: string;
  model?: string; 
  selectedFiles?: string[]; // Add selectedFiles property
}

const useChat = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const sendMessage = async (message: string, selectedFiles: string[]) => { // Add selectedFiles parameter
    const newMessage: ChatMessage = { user: 'user', message, selectedFiles };
    setChatHistory([...chatHistory, newMessage]);

    try {
      const response = await axios.post(`${config.BASE_URL}/creator/chat`, { 
        message, 
        selectedFiles 
      }); 
      const botResponse: ChatMessage = { 
        user: 'bot', 
        message: response.data.message, 
        model: response.data.model,
      };
      setChatHistory([...chatHistory, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return { chatHistory, sendMessage };
};

export default useChat;