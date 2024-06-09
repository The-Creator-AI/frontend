import { NodeId } from 'react-accessible-treeview';
import { BehaviorSubject } from 'rxjs';

interface AppState {
  currentPath: string;
  selectedFiles: { nodeId: NodeId; filePath: string }[]; 
}

const initialState: AppState = {
  // @ts-ignore
  currentPath: new URL(window.location.href).searchParams.get('path') || '',
  selectedFiles: [],
};

const appStateSubject = new BehaviorSubject<AppState>(initialState);
export const appStore$ = appStateSubject.asObservable(); 

export const updateCurrentPath = (newPath: string) => {
  appStateSubject.next({
    ...appStateSubject.getValue(),
    currentPath: newPath,
  });
};

export const updateSelectedFiles = (newFiles: { nodeId: NodeId; filePath: string }[]) => {
  appStateSubject.next({
    ...appStateSubject.getValue(),
    selectedFiles: newFiles,
  });
};
