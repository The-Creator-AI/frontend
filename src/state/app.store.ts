import { NodeId } from 'react-accessible-treeview';
import { Store } from './store';

export enum AppActions {
  UPDATE_CURRENT_PATH = 'UPDATE_CURRENT_PATH',
  UPDATE_SELECTED_FILES = 'UPDATE_SELECTED_FILES',
}

interface AppState {
  currentPath: string;
  selectedFiles: { nodeId: NodeId; filePath: string }[]; 
}

const initialState: AppState = {
  currentPath: new URL(window.location.href).searchParams.get('path') || '',
  selectedFiles: [],
};

const appStateSubject = new Store<AppState, AppActions>(initialState);
export const appStore$ = appStateSubject.asObservable(); 

export const updateCurrentPath = (newPath: string) => {
  appStateSubject._next({
    ...appStateSubject.getValue(),
    currentPath: newPath,
  }, AppActions.UPDATE_CURRENT_PATH);
};

export const updateSelectedFiles = (newFiles: { nodeId: NodeId; filePath: string }[]) => {
  appStateSubject._next({
    ...appStateSubject.getValue(),
    selectedFiles: newFiles,
  }, AppActions.UPDATE_SELECTED_FILES);
};
