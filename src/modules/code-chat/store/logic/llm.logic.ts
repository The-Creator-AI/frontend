import {
  BotMessageChunk,
  ChatMessageType,
} from "@The-Creator-AI/fe-be-common/dist/types";
import { updateChatHistory, updateChatIsLoading } from "./chat.logic";
import { getChatById } from "../code-chat.store";
import { getGatewayListener } from "../../../gateway";
import { ToClient } from "@The-Creator-AI/fe-be-common";

const addBotMessageChunk = (chatId: number, message: BotMessageChunk) => {
  const { chunk, ...messageWithoutChunk } = message;
  const chatHistory = getChatById(chatId)?.chat_history || [];
  const existingMessage = chatHistory.find(
    (message) => message.uuid === messageWithoutChunk.uuid
  );
  const newChatHistory = chatHistory.filter(
    (message) => message.uuid !== messageWithoutChunk.uuid
  );
  newChatHistory.push({
    ...messageWithoutChunk,
    message: (existingMessage?.message || "") + (chunk || ""),
  });
  updateChatHistory(chatId, [...newChatHistory]);
};

const addBotMessage = (chatId: number, message: ChatMessageType) => {
  const chatHistory = getChatById(chatId)?.chat_history || [];
  const newChatHistory = chatHistory.filter((msg) => msg.uuid !== message.uuid);
  newChatHistory.push(message);
  updateChatHistory(chatId, [...newChatHistory]);
};

export const onBotMessageChunk = getGatewayListener(
  ToClient.BOT_MESSAGE_CHUNK,
  (message) => {
    addBotMessageChunk(message.chatId, message);
  }
);

export const onBotMessage = getGatewayListener(
  ToClient.BOT_MESSAGE,
  (message) => {
    addBotMessage(message.chatId, message);
    updateChatIsLoading(message.chatId, false);
  }
);
