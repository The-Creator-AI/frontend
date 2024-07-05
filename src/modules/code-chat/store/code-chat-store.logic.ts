import { NodeId } from "react-accessible-treeview";
import {
  CodeChatStoreState,
  codeChatStoreStateSubject,
  initialState,
} from "./code-chat.store";
import { Agent } from "../../../types/agent.type";
import { CodeChatActions } from "./code-chat-store.actions";
import { ChatMessageType } from '@The-Creator-AI/fe-be-common/dist/types';
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import config from "../../../config";

export const resetAppStore = () => {
  codeChatStoreStateSubject._next(
    initialState,
    CodeChatActions.RESET_APP_STORE
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

export const updateSelectedFiles = (
  newFiles: { nodeId: NodeId; filePath: string }[]
) => {
  codeChatStoreStateSubject._next(
    {
      ...codeChatStoreStateSubject.getValue(),
      selectedFiles: newFiles,
    },
    CodeChatActions.UPDATE_SELECTED_FILES
  );
};

export const updateRecentFiles = (
  newFiles: { nodeId: NodeId; filePath: string }[]
) => {
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
    const response = await axios.post(`${config.BASE_URL}/creator/chat`, {
      chatHistory: [
        ...chatHistory.filter((message) => message.user !== "instructor"),
        ...messages,
      ],
      selectedFiles,
    });
    updateChatHistory([
      ...chatHistory,
      {
        user: "user",
        message,
        uuid: uuidv4(),
      },
      response.data,
    ]);
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    updateChatIsLoading(false);
  }
};
