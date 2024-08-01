import {
  AgentType,
  ChatMessageType,
  ChatType,
} from "@The-Creator-AI/fe-be-common/dist/types";
import { CodeChatActions } from "../code-chat.actions";
import { v4 as uuidv4 } from "uuid";
import {
  CHAT_ID_OFFSET,
  CodeChatStoreState,
  codeChatStoreStateSubject,
  getChatById,
} from "../code-chat.store";
import { sendMessage } from "../../../gateway/store/gateway.logic";
import { ToClient, ToServer } from "@The-Creator-AI/fe-be-common";
import { getGatewayListener } from "../../../gateway";
import { updateSavedChats } from "./sidebar.logic";

export const updateSelectedAgent = (agent: AgentType | null) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      selectedAgent: agent,
    },
    CodeChatActions.UPDATE_SELECTED_AGENT
  );
};

export const updateChatTitle = (chatId: number, newTitle: string) => {
  const newChats = codeChatStoreStateSubject.getValue().chats.map((chat) => {
    if (chat.id === chatId) {
      return {
        ...chat,
        title: newTitle,
      };
    }
    return chat;
  });
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      chats: newChats,
    },
    CodeChatActions.UPDATE_CHAT_HISTORY
  );
};

export const clearChats = () => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      chats: [],
    },
    CodeChatActions.CLEAR_CHATS
  );
};

export const updateChatHistory = (
  chatId: number,
  newChatHistory: CodeChatStoreState["chats"][0]["chat_history"]
) => {
  const newChats = codeChatStoreStateSubject.getValue().chats.map((chat) => {
    if (chat.id === chatId) {
      return {
        ...chat,
        chat_history: newChatHistory,
      };
    }
    return chat;
  });
  const matchingChat = getChatById(chatId);
  if (!matchingChat) {
    newChats.push({
      id: chatId,
      title: "",
      description: "",
      isLoading: false,
      chat_history: newChatHistory,
    });
  }
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      chats: newChats,
    },
    CodeChatActions.UPDATE_CHAT_HISTORY
  );
};

export const updateTokenCount = (newTokenCount: number) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      tokenCount: newTokenCount,
    },
    CodeChatActions.UPDATE_TOKEN_COUNT
  );
};

export const updateChatIsLoading = (chatId: number, isLoading: boolean) => {
  const chat = getChatById(chatId);
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      chats: [
        ...codeChatStoreStateSubject
          .getValue()
          .chats.filter((chat) => chat.id !== chatId),
        {
          ...chat,
          isLoading,
        } as any,
      ],
    },
    CodeChatActions.UPDATE_CHAT_IS_LOADING
  );
};

export const saveChat = async (
  chat: Omit<ChatType, "id"> & { id?: number }
) => {
  try {
    sendMessage(ToServer.SAVE_CHAT, {
      ...chat,
      id: chat.id && chat.id > CHAT_ID_OFFSET ? undefined : chat.id,
    });
  } catch (error) {
    console.error("Error saving chat:", error);
  }
};

export const deleteChat = async (id: number) => {
  try {
    sendMessage(ToServer.DELETE_CHAT, { id });
  } catch (error) {
    console.error("Error deleting chat:", error);
  }
};

export const onChats = getGatewayListener(
  ToClient.CHATS,
  (chats: ChatType[]) => {
    updateSavedChats(chats);
  }
);

// TODO: imageFiles still need to be handled once backend is ready for it
export const sendChatMessage = async (args: {
  chatId: number;
  chatTitle?: string;
  agentName?: string;
  agentInstruction?: string;
  message: string;
  selectedFiles: string[];
  imageFiles?: File[];
  chatHistory?: CodeChatStoreState["chats"][0]["chat_history"];
}) => {
  console.log({ args });
  const {
    chatId,
    chatTitle,
    agentName,
    agentInstruction,
    message,
    selectedFiles,
  } = args;
  const chat = getChatById(chatId);
  const chatHistory =
    (chat?.chat_history.length ? chat?.chat_history : args.chatHistory) || [];
  const messages: ChatMessageType[] = [];
  if (agentInstruction) {
    messages.push({
      chatId,
      user: "instructor",
      message: agentInstruction,
      agentName,
      uuid: uuidv4(),
    });
  }
  messages.push({
    chatId,
    user: "user",
    message,
    uuid: uuidv4(),
  });
  updateChatHistory(chatId, [...chatHistory, ...messages]);
  updateChatTitle(chatId, chatTitle || chat?.title || "Untitled Chat");
  updateChatIsLoading(chatId, true);

  try {
    sendMessage(ToServer.USER_MESSAGE, {
      chatId,
      chatHistory: [
        ...chatHistory.filter((message) => message.user !== "instructor"),
        ...messages,
      ],
      selectedFiles,
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export const updateAgents = (agents: AgentType[]) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      agents,
    } as any,
    CodeChatActions.UPDATE_SELECTED_AGENT
  );
};
