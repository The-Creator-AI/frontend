import {
  AgentType,
  ChatMessageType,
  ChatType,
  PlanType,
  SummarizedResultChunk,
} from "@The-Creator-AI/fe-be-common/dist/types";
import { Store } from "../../../state/store";
import {
  LOCAL_STORAGE_KEY,
  getFromLocalStorage,
} from "../../../utils/local-storage";
import { CodeChatActions } from "./code-chat.actions";
import * as Modals from '../components/modals';

interface FileTreeNode {
  name: string;
  children: FileTreeNode[];
}

export interface CodeChatStoreState {
  currentPath: string;
  selectedFiles: string[];
  recentFiles: string[];
  agents: AgentType[];
  selectedAgent: AgentType | null;
  chats: (ChatType & {
    isLoading: boolean;
  })[];
  tokenCount: number;
  breadcrumb?: {
    items: {
      label: string;
      href: string;
      disabled?: boolean;
      onClick?: () => void;
    }[];
  };
  stage?:
    | {
        type: "file";
        filePath?: string;
        content?: string;
      }
    | {
        type: "plan" | "chat";
        activeChatId?: number;
        title?: string;
      }
    | {
        type: "settings";
        pageId: string;
        agentId?: string;
      };
  savedPlans: PlanType[];
  savedChats: ChatType[];
  openModals: {
    type: keyof typeof Modals;
    props: any;
  }[];
  collapsedSections: {
    [sectionId: string]: boolean; // Use a map to store the collapsed state
  };
  fileTreeData: FileTreeNode;
}

const currentPath = new URL(window.location.href).searchParams.get("path") || "";
export const initialState: CodeChatStoreState = {
  currentPath: currentPath,
  selectedFiles: getFromLocalStorage<Record<string, Array<string>>>(
    LOCAL_STORAGE_KEY.SELECTED_FILES
  )?.[currentPath] || [],
  recentFiles: [],
  agents: [],
  selectedAgent: null,
  chats: [],
  tokenCount: 0,
  breadcrumb: {
    items: [
      {
        label: "Chat",
        href: "/chat",
        disabled: true,
      },
      {
        label: "New Chat",
        href: "/new-chat",
      },
    ],
  },
  stage: {
    type: "chat",
  },
  savedPlans: [],
  savedChats: [],
  openModals: [],
  collapsedSections: {}, // Initialize collapsedSections as an empty object
  fileTreeData: {
    name: "",
    children: [], // Initialize fileTreeData with empty children array
  },
};

export const codeChatStoreStateSubject = new Store<
  CodeChatStoreState,
  CodeChatActions
>(initialState);

export const getCurrentPath = () =>
  codeChatStoreStateSubject.getValue().currentPath;
export const getChats = () => codeChatStoreStateSubject.getValue().chats;
export const getChatsReversed = () =>
  [...codeChatStoreStateSubject.getValue().chats].reverse();
export const getChatById = (id: number): CodeChatStoreState["chats"][0] | undefined =>
  codeChatStoreStateSubject.getValue().chats.find((chat) => chat.id === id);
export const getChatByTitle = (title: string): CodeChatStoreState["chats"][0] | undefined =>
  codeChatStoreStateSubject.getValue().chats.find((chat) => chat.title === title);
export const getFirstChat = () => codeChatStoreStateSubject.getValue().chats[0];
export const getChatIdForFirstChat = () => codeChatStoreStateSubject.getValue().chats[0]?.id || generateChatIdForIndex(0);
export const CHAT_ID_OFFSET = 100000000;
export const generateChatIdForIndex = (index: number) => CHAT_ID_OFFSET + index;
export const getChatIdForNewChat = () => generateChatIdForIndex(codeChatStoreStateSubject.getValue().chats.length);

