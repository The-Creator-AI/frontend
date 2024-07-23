import axios from 'axios';
import config from '../../../../../config';
import { codeChatStore$ } from '../../../store/code-chat.store';
import useStore from '../../../../../state/useStore';
import { v4 as uuidv4 } from 'uuid';
import useDebounce from '../../../../../hooks/useDebounce';
import { sendChatMessage, updateChatHistory, updateTokenCount } from '../../../store/code-chat-store.logic';
import { ChatMessageType } from '@The-Creator-AI/fe-be-common/dist/types';

const useChat = () => {
  const { chat: { chatHistory, isLoading } = {
    chatHistory: [],
    isLoading: false,
  }, tokenCount } = useStore(codeChatStore$);

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

  return { chatHistory, tokenCount, sendMessage: sendChatMessage, isLoading, deleteMessage, setMessageCollapsed, handleTokenCount };
};

export default useChat;
