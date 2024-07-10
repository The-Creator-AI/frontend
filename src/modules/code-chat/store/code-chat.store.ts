import { NodeId } from 'react-accessible-treeview';
import { Store } from '../../../state/store';
import { Agent } from '../../../types/agent.type';
import { ChatMessageType } from '@The-Creator-AI/fe-be-common/dist/types';
import { AGENTS } from '../constants';
import { CodeChatActions } from './code-chat-store.actions';


export interface CodeChatStoreState {
  currentPath: string;
  selectedFiles: string[];
  recentFiles: string[];
  agents: Agent[];
  selectedAgent: Agent | null;
  chat: {
    chatHistory: ChatMessageType[];
    isLoading: boolean;
  };
  tokenCount: number;
  fileContentPopup: {
    isOpen: boolean;
    filePath?: string;
    content?: string;
  };
}

export const initialState: CodeChatStoreState = {
  currentPath: new URL(window.location.href).searchParams.get('path') || '',
  selectedFiles: [],
  recentFiles: [],
  agents: AGENTS.filter(agent => !agent.hidden),
  selectedAgent: null,
  chat: {
    chatHistory: [],
    isLoading: false
  },
  tokenCount: 0,
  fileContentPopup: {
    isOpen: false,
  }
};

export const codeChatStoreStateSubject = new Store<CodeChatStoreState, CodeChatActions>(initialState);
export const codeChatStore$ = codeChatStoreStateSubject.asObservable();

