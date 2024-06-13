import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './App.scss';
import FileExplorer from './components/file-explorer/FileExplorer';
import { appStore$, updateSelectedFiles } from './state/app.store';
import useStore from './state/useStore';


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
    <div className="App">
      <FileExplorer />
    </div>
  );
}

export default App;
