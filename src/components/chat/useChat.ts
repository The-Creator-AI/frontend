import { useState } from 'react';
import axios from 'axios';
import config from '../../config';

export interface ChatMessage {
  user: 'user' | 'bot' | 'instructor';
  message: string;
  model?: string; 
  selectedFiles?: string[];
  agentName?: string;
}

const useChat = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: imageFiles still need to be handled once backend is ready for it
  const sendMessage = async (args: {
    agentName?: string;
    agentInstruction?: string;
    message: string;
    selectedFiles: string[];
    imageFiles?: File[];
  }) => {
    const { agentName, agentInstruction, message, selectedFiles } = args;
    const messages: ChatMessage[] = [];
    if (agentInstruction) {
      messages.push({ user: 'instructor', message: agentInstruction, agentName });
    }
    messages.push({ user: 'user', message, selectedFiles });
    setChatHistory((chatHistory) => [...chatHistory, ...messages]);

    setIsLoading(true);

    try {
      const response = await axios.post(`${config.BASE_URL}/creator/chat`, { 
        chatHistory: [...chatHistory, ...messages], 
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