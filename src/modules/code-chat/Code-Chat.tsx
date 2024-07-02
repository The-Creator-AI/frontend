import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Code-Chat.scss';
import FileExplorer from './components/file-explorer/FileExplorer';
import Tips from './components/tips/Tips';
import useStore from '../../state/useStore';
import { appStore$ } from './store/app.store';


function CodeChat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPath } = useStore(appStore$);

  useEffect(() => {
    const paramsObject = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...paramsObject, path: currentPath });
  }, [currentPath, searchParams, setSearchParams]);

  return (
    <div className="CodeChat">
      <Tips />
      <FileExplorer />
    </div>
  );
}

export default CodeChat;