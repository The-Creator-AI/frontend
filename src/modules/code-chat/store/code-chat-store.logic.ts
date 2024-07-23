import { NodeId } from "react-accessible-treeview";
import {
  CodeChatStoreState,
  codeChatStoreStateSubject,
  initialState,
} from "./code-chat.store";
import { Agent } from "../../../types/agent.type";
import { CodeChatActions } from "./code-chat-store.actions";
import {
  BotMessageChunk,
  ChatMessageType,
  ChatType,
  PlanType,
} from "@The-Creator-AI/fe-be-common/dist/types";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import config from "../../../config";
import { sendMessage } from "../../gateway/store/gateway.logic";
import { ToClient, ToServer } from "@The-Creator-AI/fe-be-common";
import { getGatewayListener } from "../../gateway";
import {
  LOCAL_STORAGE_KEY,
  saveToLocalStorage,
} from "../../../utils/local-storage";

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

export const updateSelectedAgent = (agent: Agent | null) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      selectedAgent: agent,
    },
    CodeChatActions.UPDATE_SELECTED_AGENT
  );
};

export const updateChatHistory = (
  newChatHistory: CodeChatStoreState["chat"]["chatHistory"]
) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      chat: {
        ...codeChatStoreStateSubject.getValue().chat,
        chatHistory: newChatHistory,
      },
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

export const updateChatIsLoading = (isLoading: boolean) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      chat: {
        ...codeChatStoreStateSubject.getValue().chat,
        isLoading,
      },
    },
    CodeChatActions.UPDATE_CHAT_IS_LOADING
  );
};

export const updateFileContentPopup = (
  newState: Partial<CodeChatStoreState["fileContentPopup"]>
) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      fileContentPopup: {
        ...codeChatStoreStateSubject.getValue().fileContentPopup,
        ...newState,
      },
    },
    CodeChatActions.UPDATE_FILE_CONTENT_POPUP
  );
};

// TODO: imageFiles still need to be handled once backend is ready for it
export const sendChatMessage = async (args: {
  agentName?: string;
  agentInstruction?: string;
  message: string;
  selectedFiles: string[];
  imageFiles?: File[];
}) => {
  const { agentName, agentInstruction, message, selectedFiles } = args;
  const {
    chat: { chatHistory },
  } = codeChatStoreStateSubject.getValue();
  const messages: ChatMessageType[] = [];
  if (agentInstruction) {
    messages.push({
      user: "instructor",
      message: agentInstruction,
      agentName,
      uuid: uuidv4(),
    });
  }
  messages.push({
    user: "user",
    message,
    uuid: uuidv4(),
  });
  updateChatHistory([...chatHistory, ...messages]);

  updateChatIsLoading(true);

  try {
    sendMessage(ToServer.USER_MESSAGE, {
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
}

const addBotMessageChunk = (message: BotMessageChunk) => {
  console.log("addBotMessageChunk", message);
  const { chunk, ...messageWithoutChunk } = message;
  const chatHistory = codeChatStoreStateSubject.getValue().chat.chatHistory;
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
  updateChatHistory([...newChatHistory]);
};

const addBotMessage = (message: ChatMessageType) => {
  const chatHistory = codeChatStoreStateSubject.getValue().chat.chatHistory;
  const newChatHistory = chatHistory.filter((msg) => msg.uuid !== message.uuid);
  console.log({ chatHistory, message, newChatHistory });
  newChatHistory.push(message);
  updateChatHistory([...newChatHistory]);
};

export const oneBotMessageChunk = getGatewayListener(
  ToClient.BOT_MESSAGE_CHUNK,
  (message) => {
    addBotMessageChunk(message);
  }
);

export const onBotMessage = getGatewayListener(
  ToClient.BOT_MESSAGE,
  (message) => {
    addBotMessage(message);
    updateChatIsLoading(false);
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
    sendMessage(ToServer.SAVE_CHAT, chat);
  } catch (error) {
    console.error("Error saving chat:", error);
  }
};

export const onChats = getGatewayListener(
  ToClient.CHATS,
  (chats: ChatType[]) => {
    updateSavedChats(chats);
  }
);
