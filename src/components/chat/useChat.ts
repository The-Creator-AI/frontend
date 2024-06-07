import { useState } from 'react';
import axios from 'axios';
import config from '../../config';

export interface ChatMessage {
  user: 'user' | 'bot';
  message: string;
  model?: string; // Add model property
}

const useChat = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const sendMessage = async (message: string) => {
    const newMessage: ChatMessage = { user: 'user', message };
    setChatHistory([...chatHistory, newMessage]);

    try {
      const response = await axios.post(`${config.BASE_URL}/creator/chat`, { message }); 
      const botResponse: ChatMessage = { user: 'bot', message: response.data.message, model: response.data.model };
      setChatHistory([...chatHistory, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle errors gracefully, e.g., display an error message to the user
    }
  };

  return { chatHistory, sendMessage };
};

export default useChat;