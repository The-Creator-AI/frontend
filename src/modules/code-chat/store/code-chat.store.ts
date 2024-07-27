import { NodeId } from "react-accessible-treeview";
import { Store } from "../../../state/store";
import { Agent } from "../../../types/agent.type";
import {
  ChatMessageType,
  PlanType,
  ChatType,
} from "@The-Creator-AI/fe-be-common/dist/types";
import { AGENTS } from "../constants";
import { CodeChatActions } from "./code-chat-store.actions";
import {
  LOCAL_STORAGE_KEY,
  getFromLocalStorage,
} from "../../../utils/local-storage";

export interface CodeChatStoreState {
  currentPath: string;
  selectedFiles: string[];
  recentFiles: string[];
  agents: (Agent & { editable: boolean })[];
  selectedAgent: Agent | null;
  chat: {
    chatHistory: ChatMessageType[];
    isLoading: boolean;
  };
  tokenCount: number;
  breadcrumb?: {
    items: {
      label: string;
      href: string;
      disabled?: boolean;
      onClick?: () => void;
    }[];
  },
  stage?: {
    type: 'file';
    filePath?: string;
    content?: string;
  } | {
    type: 'plan' | 'chat';
    activeChatId?: number;
    title?: string;
  } | {
    type: 'settings';
    pageId: string;
    agentId?: string;
  };
  savedPlans: PlanType[];
  savedChats: ChatType[];
}

export const initialState: CodeChatStoreState = {
  currentPath: new URL(window.location.href).searchParams.get("path") || "",
  selectedFiles: getFromLocalStorage(
    LOCAL_STORAGE_KEY.SELECTED_FILES
  ) as string[],
  recentFiles: [],
  agents: AGENTS.filter((agent) => !agent.hidden).map((agent) =>({
    ...agent,
    editable: false
  })),
  selectedAgent: null,
  chat: {
    chatHistory: [],
    isLoading: false,
  },
  tokenCount: 0,
  breadcrumb: {
    items: [{
      label: 'Chat',
      href: '/chat',
      disabled: true
    }, {
      label: 'New Chat',
      href: '/new-chat'
    }],
  },
  stage: {
    type: 'chat',
  },
  savedPlans: [],
  savedChats: [],
};

export const codeChatStoreStateSubject = new Store<
  CodeChatStoreState,
  CodeChatActions
>(initialState);
export const codeChatStore$ = codeChatStoreStateSubject.asObservable();

