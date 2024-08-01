import {
  LOCAL_STORAGE_KEY,
  saveToLocalStorage,
} from "../../../../utils/local-storage";
import { CodeChatActions } from "../code-chat.actions";
import {
  CodeChatStoreState,
  codeChatStoreStateSubject,
} from "../code-chat.store";

import axios from "axios";
import config from "../../../../config";
import { updateFileTreeData } from "./sidebar.logic";
import { sendMessage } from "../../../gateway/store/gateway.logic";
import { ToServer } from "@The-Creator-AI/fe-be-common";
import { ParsedMessage } from "../../components/arena/chat/chat-history/code-plan/CodePlanDisplay.utils";

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

export const fetchFileTreeData = async (currentPath: string) => {
  try {
    const { data } = await axios.get(
      `${config.BASE_URL}/creator/directory-structure?dir=${currentPath}`,
      {
        responseType: "json",
      }
    );

    updateFileTreeData(data as CodeChatStoreState["fileTreeData"]);
  } catch (error) {
    console.error("Error fetching file tree data:", error);
  }
};

export const saveCodeToFile = async (
  filePath: string,
  currentPath: string,
  code: string
) => {
  try {
    sendMessage(ToServer.SAVE_CODE_TO_FILE, { filePath, currentPath, code });
  } catch (error) {
    console.error("Error saving code to file:", error);
  }
};

export const saveCodeToFileFromDeveloperResponse = async (
  parsedMessage: ParsedMessage,
  currentPath: string
) => {
  console.log({ parsedMessage });
  if (parsedMessage.filePath && parsedMessage.code) {
    try {
      await saveCodeToFile(
        parsedMessage.filePath,
        currentPath,
        parsedMessage.code
      );
    } catch (error) {
      console.error("Failed to save code:", error);
      alert("Failed to save code. Please try again.");
    }
  }
};
