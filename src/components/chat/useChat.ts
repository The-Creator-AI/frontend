import axios from 'axios';
import config from '../../config';
import { appStore$, updateChatHistory, updateChatIsLoading, updateTokenCount } from '../../state/app.store';
import useStore from '../../state/useStore';
import { v4 as uuidv4 } from 'uuid';
import useDebounce from '../../hooks/useDebounce';

export interface ChatMessageType {
  uuid: string;
  user: 'user' | 'bot' | 'instructor';
  message: string;
  model?: string;
  selectedFiles?: string[];
  agentName?: string;
  isCollapsed?: boolean;
}

const useChat = () => {
  const { chat: { chatHistory, isLoading } = {
    chatHistory: [],
    isLoading: false,
  }, tokenCount } = useStore(appStore$);

  const handleTokenCount = useDebounce
    (async (args: {
      agentName?: string;
      agentInstruction?: string;
      message: string;
      selectedFiles: string[];
      imageFiles?: File[];
    }) => {
      const { agentName, agentInstruction, message, selectedFiles, imageFiles } = args;

      if (!message && imageFiles?.length !> 0) {
        updateTokenCount(0);
      }

      try {
        const messages: ChatMessageType[] = [];
        if (agentInstruction) {
          messages.push({
            user: 'instructor',
            message: agentInstruction,
            agentName,
            uuid: uuidv4(),
          });
        }
        messages.push({
          user: 'user',
          message,
          selectedFiles,
          uuid: uuidv4()
        });
        const response = await axios.post(`${config.BASE_URL}/creator/token-count`, {
          chatHistory: [
            ...chatHistory.filter((message) => message.user !== 'instructor'),
            ...messages
          ],
          selectedFiles
        });
        updateTokenCount(response.data);
      } catch (error) {
        console.error('Error fetching token count:', error);
      }
    }, 500); // Debounce time: 500 milliseconds

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
      messages.push({
        user: 'instructor',
        message: agentInstruction,
        agentName,
        uuid: uuidv4(),
      });
    }
    messages.push({
      user: 'user',
      message,
      selectedFiles,
      uuid: uuidv4()
    });
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
        uuid: uuidv4(),
      };
      updateChatHistory([...chatHistory, {
        user: 'user',
        message,
        selectedFiles,
        uuid: uuidv4(),
      }, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      updateChatIsLoading(false);
    }
  };

  const deleteMessage = (uuid: string) => {
    updateChatHistory(
      chatHistory.filter((message) => message.uuid !== uuid)
    );
  };

  const setMessageCollapsed = (uuid: string, isCollapsed: boolean) => {
    updateChatHistory(
      chatHistory.map((message) => {
        if (message.uuid === uuid) {
          return { ...message, isCollapsed };
        }
        return message;
      })
    );
  };

  return { chatHistory, tokenCount, sendMessage, isLoading, deleteMessage, setMessageCollapsed, handleTokenCount };
};

export default useChat;
