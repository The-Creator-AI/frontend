import { useState } from 'react';
import axios from 'axios';
import config from '../../config';

export interface ChatMessage {
  user: 'user' | 'bot';
  message: string;
  model?: string; 
  selectedFiles?: string[];
}

const useChat = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: imageFiles still need to be handled once backend is ready for it
  const sendMessage = async (message: string, selectedFiles: string[], imageFiles?: File[]) => {
    const newMessage: ChatMessage = { user: 'user', message, selectedFiles };
    setChatHistory((chatHistory) => [...chatHistory, newMessage]);

    setIsLoading(true);

    try {
      const response = await axios.post(`${config.BASE_URL}/creator/chat`, { 
        chatHistory: [...chatHistory, newMessage], 
        selectedFiles 
      }); 
      const botResponse: ChatMessage = { 
        user: 'bot', 
        message: response.data.message, 
        model: response.data.model,
      };
      console.log({ chatHistory });
      setChatHistory((chatHistory) => [...chatHistory, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (indexToDelete: number) => {
    setChatHistory(prevHistory => 
      prevHistory.filter((_, index) => index !== indexToDelete)
    );
  };

  return { chatHistory, sendMessage, isLoading, deleteMessage };
};

export default useChat;