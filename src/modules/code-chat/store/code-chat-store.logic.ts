import { ToClient, ToServer } from "@The-Creator-AI/fe-be-common";
import {
  AgentType,
  BotMessageChunk,
  ChatMessageType,
  ChatType,
  PlanType,
} from "@The-Creator-AI/fe-be-common/dist/types";
import { v4 as uuidv4 } from "uuid";
import {
  LOCAL_STORAGE_KEY,
  saveToLocalStorage,
} from "../../../utils/local-storage";
import { getGatewayListener } from "../../gateway";
import { sendMessage } from "../../gateway/store/gateway.logic";
import { CodeChatActions } from "./code-chat-store.actions";
import {
  CHAT_ID_OFFSET,
  CodeChatStoreState,
  codeChatStoreStateSubject,
  getChatById,
  getCurrentPath,
  initialState,
} from "./code-chat.store";
import { ParsedMessage } from "../components/arena/chat/chat-history/code-plan/CodePlanDisplay.utils";
import * as Modals from '../components/modals';

export const resetCodeChatStore = () => {
  codeChatStoreStateSubject._next(
    initialState,
    CodeChatActions.RESET_CODE_CHAT_STORE
  );
};

export const updateCurrentPath = (newPath: string) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      currentPath: newPath,
    },
    CodeChatActions.UPDATE_CURRENT_PATH
  );
};

export const updateSelectedFiles = (newFiles: string[]) => {
  saveToLocalStorage(LOCAL_STORAGE_KEY.SELECTED_FILES, newFiles);
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      selectedFiles: newFiles,
    },
    CodeChatActions.UPDATE_SELECTED_FILES
  );
};

export const updateRecentFiles = (newFiles: string[]) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      recentFiles: newFiles,
    },
    CodeChatActions.UPDATE_RECENT_FILES
  );
};

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
}

export const clearChats = () => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      chats: [],
    },
    CodeChatActions.CLEAR_CHATS
  );
}

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
    })
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
        ...codeChatStoreStateSubject.getValue().chats.filter(
          (chat) => chat.id !== chatId
        ),{
          ...chat,
          isLoading
        } as any
      ],
    },
    CodeChatActions.UPDATE_CHAT_IS_LOADING
  );
};

export const updateStage = (newState: {
  stage: Partial<CodeChatStoreState["stage"]>;
  breadcrumb: Partial<CodeChatStoreState["breadcrumb"]>;
}) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      stage: {
        ...codeChatStoreStateSubject.getValue().stage,
        ...newState.stage
      } as any,
      breadcrumb: {
        ...codeChatStoreStateSubject.getValue().breadcrumb,
        ...newState.breadcrumb,
      } as any
    },
    CodeChatActions.UPDATE_STAGE
  );
};

export const updateCollapsedSections = (newCollapsedSections: CodeChatStoreState["collapsedSections"]) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      collapsedSections: newCollapsedSections
    },
    CodeChatActions.UPDATE_COLLAPSED_SECTIONS
  );
}

// TODO: imageFiles still need to be handled once backend is ready for it
export const sendChatMessage = async (args: {
  chatId: number;
  chatTitle?: string;
  agentName?: string;
  agentInstruction?: string;
  message: string;
  selectedFiles: string[];
  imageFiles?: File[];
  chatHistory?: CodeChatStoreState["chats"][0]["chat_history"]
}) => {
  console.log({ args });
  const { chatId, chatTitle, agentName, agentInstruction, message, selectedFiles } = args;
  const chat = getChatById(chatId);
  const chatHistory = (chat?.chat_history.length ? chat?.chat_history : args.chatHistory) || [];
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

export const updateSavedPlans = (plans: PlanType[]) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      savedPlans: plans,
    },
    CodeChatActions.UPDATE_SAVED_PLANS
  );
};

export const updateSavedChats = (chats: ChatType[]) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      savedChats: chats,
    },
    CodeChatActions.UPDATE_SAVED_CHATS
  );
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

export const fetchSavedPlans = async () => {
  try {
    sendMessage(ToServer.GET_PLANS, {});
  } catch (error) {
    console.error("Error fetching saved plans:", error);
  }
};

export const savePlan = async (
  plan: Omit<PlanType, "id"> & { id?: number }
) => {
  try {
    sendMessage(ToServer.SAVE_PLAN, plan);
  } catch (error) {
    console.error("Error saving plan:", error);
  }
};

export const onPlans = getGatewayListener(
  ToClient.PLANS,
  (plans: PlanType[]) => {
    updateSavedPlans(plans);
  }
);

export const deletePlan = async (id: number) => {
  try {
    sendMessage(ToServer.DELETE_PLAN, { id });
  } catch (error) {
    console.error("Error deleting plan:", error);
  }
};

export const fetchSavedChats = async () => {
  try {
    sendMessage(ToServer.GET_CHATS, {});
  } catch (error) {
    console.error("Error fetching saved chats:", error);
  }
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

export const fetchAgents = async () => {
  try {
    sendMessage(ToServer.GET_AGENTS, {});
  } catch (error) {
    console.error("Error fetching agents:", error);
  }
};

export const saveAgent = async (agent: Omit<AgentType, 'id'> & { id?: number }) => {
  try {
    sendMessage(ToServer.SAVE_AGENT, agent);
  } catch (error) {
    console.error("Error saving agent:", error);
  }
};

export const deleteAgent = async (id: number) => {
  try {
    sendMessage(ToServer.DELETE_AGENT, { id });
  } catch (error) {
    console.error("Error deleting agent:", error);
  }
};

export const onAgents = getGatewayListener(
  ToClient.AGENTS,
  (agents: AgentType[]) => {
    updateAgents(agents);
  }
);

export const saveCodeToFile = async (filePath: string, currentPath: string, code: string) => {
  try {
    sendMessage(ToServer.SAVE_CODE_TO_FILE, { filePath, currentPath, code });
  } catch (error) {
    console.error("Error saving code to file:", error);
  }
};

export const saveCodeToFileFromDeveloperResponse = async (parsedMessage: ParsedMessage, currentPath: string) => {
  console.log({ parsedMessage });
  if (parsedMessage.filePath && parsedMessage.code) {
      try {
          await saveCodeToFile(parsedMessage.filePath, currentPath, parsedMessage.code);
      } catch (error) {
          console.error('Failed to save code:', error);
          alert('Failed to save code. Please try again.');
      }
  }
};

export const updateOpenModals = (modals: CodeChatStoreState["openModals"]) => {
  codeChatStoreStateSubject._next(
      {
          ...codeChatStoreStateSubject.getValue(),
          openModals: modals,
      },
      CodeChatActions.UPDATE_OPEN_MODALS
  );
};

export const openModal = <T extends keyof typeof Modals,>(modal: T, props?: Parameters<typeof Modals[T]>[0]) => {
  const openModals = codeChatStoreStateSubject.getValue().openModals;
  if (openModals.find((m) => m.type === modal)) {
    return;
  }
  updateOpenModals([...openModals, {
    type: modal,
    props: props,
  }]);
};

export const closeModal = <T extends keyof typeof Modals,>(modal: T) => {
  const openModals = codeChatStoreStateSubject.getValue().openModals;
  if (!openModals.find((m) => m.type === modal)) {
    return;
  }
  updateOpenModals(openModals.filter((m) => m.type !== modal));
};

export const toggleSection = (sectionId: string) => {
  const collapsedSections = codeChatStoreStateSubject.getValue().collapsedSections || {};
  const newCollapsedSections = { ...collapsedSections, [sectionId]: !collapsedSections[sectionId] };
  updateCollapsedSections(newCollapsedSections);
}
