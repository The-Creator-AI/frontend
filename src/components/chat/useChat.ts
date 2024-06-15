import axios from 'axios';
import config from '../../config';
import { appStore$, updateChatHistory, updateChatIsLoading } from '../../state/app.store';
import useStore from '../../state/useStore';

export interface ChatMessageType {
  user: 'user' | 'bot' | 'instructor';
  message: string;
  model?: string;
  selectedFiles?: string[];
  agentName?: string;
}

const useChat = () => {
  const { chat: { chatHistory, isLoading } = {
    chatHistory: [],
    isLoading: false
  }} = useStore(appStore$);

  // TODO: imageFiles still need to be handled once backend is ready for it
  const sendMessage = async (args: {
    agentName?: string;
    agentInstruction?: string;
    message: string;
    selectedFiles: string[];
    imageFiles?: File[];
  }) => {
    const { agentName, agentInstruction, message, selectedFiles } = args;
    const messages: ChatMessageType[] = [];
    if (agentInstruction) {
      messages.push({ user: 'instructor', message: agentInstruction, agentName });
    }
    messages.push({ user: 'user', message, selectedFiles });
    updateChatHistory([...chatHistory, ...messages]);

    updateChatIsLoading(true);

    try {
      const response = await axios.post(`${config.BASE_URL}/creator/chat`, {
        chatHistory: [
          ...chatHistory.filter((message) => message.user !== 'instructor'),
          ...messages],
        selectedFiles
      });
      const botResponse: ChatMessageType = {
        user: 'bot',
        message: response.data.message,
        model: response.data.model,
      };
      updateChatHistory([...chatHistory, { user: 'user', message, selectedFiles }, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      updateChatIsLoading(false);
    }
  };

  const deleteMessage = (indexToDelete: number) => {
    updateChatHistory(
      chatHistory.filter((_, index) => index !== indexToDelete)
    );
  };

  return { chatHistory, sendMessage, isLoading, deleteMessage };
};

export default useChat;
