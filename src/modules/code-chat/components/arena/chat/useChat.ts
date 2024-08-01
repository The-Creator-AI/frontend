import { ChatMessageType } from '@The-Creator-AI/fe-be-common/dist/types';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import config from '../../../../../config';
import useDebounce from '../../../../../hooks/useDebounce';
import useStore from '../../../../../state/useStore';
import { sendChatMessage, updateChatHistory, updateTokenCount } from '../../../store/code-chat.logic';
import { codeChatStore$, getChatIdForFirstChat } from '../../../store/code-chat.store';

const useChat = () => {
  const { chats, tokenCount } = useStore(codeChatStore$);
  const {
    id,
    chat_history,
    isLoading,
  } = chats?.[0] || {
    id: -1,
    chat_history: [],
    isLoading: false,
  };
  const chatId = id ?? getChatIdForFirstChat();

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
            chatId,
            user: 'instructor',
            message: agentInstruction,
            agentName,
            uuid: uuidv4(),
          });
        }
        messages.push({
          chatId,
          user: 'user',
          message,
          uuid: uuidv4()
        });
        const response = await axios.post(`${config.BASE_URL}/creator/token-count`, {
          chatHistory: [
            ...chat_history.filter((message) => message.user !== 'instructor'),
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
      chatId,
      chat_history.filter((message) => message.uuid !== uuid)
    );
  };

  const setMessageCollapsed = (uuid: string, isCollapsed: boolean) => {
    updateChatHistory(
      chatId,
      chat_history.map((message) => {
        if (message.uuid === uuid) {
          return { ...message, isCollapsed };
        }
        return message;
      })
    );
  };

  return { chatHistory: chat_history, tokenCount, sendMessage: sendChatMessage, isLoading, deleteMessage, setMessageCollapsed, handleTokenCount };
};

export default useChat;
