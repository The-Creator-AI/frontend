// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './App.scss';
import Chat from './components/chat/Chat';
import FileExplorer from './components/file-explorer/FileExplorer';
import { appStore$, updateSelectedFiles } from './state/app.store';
import useStore from './state/useStore';

const queryClient = new QueryClient();

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPath, selectedFiles } = useStore(appStore$);

  useEffect(() => {
    const paramsObject = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...paramsObject, path: currentPath });
  }, [currentPath]);

  // Load selected files from localStorage on component mount and path change
  useEffect(() => {
    const storedFiles = localStorage.getItem(`selectedFiles-${currentPath}`);
    if (storedFiles) {
      updateSelectedFiles(JSON.parse(storedFiles));
    }
  }, [currentPath]);

  // Save selected files to localStorage whenever it changes
  useEffect(() => {
    if (currentPath && selectedFiles.length) {
      localStorage.setItem(`selectedFiles-${currentPath}`, JSON.stringify(selectedFiles));
    }
  }, [currentPath, selectedFiles]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="App">
          <FileExplorer />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
