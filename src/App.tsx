import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './App.scss';
import FileExplorer from './components/file-explorer/FileExplorer';
import { appStore$ } from './state/app.store';
import useStore from './state/useStore';


function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPath } = useStore(appStore$);

  useEffect(() => {
    const paramsObject = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...paramsObject, path: currentPath });
  }, [currentPath, searchParams, setSearchParams]);

  return (
    <div className="App">
      <FileExplorer />
    </div>
  );
}

export default App;
