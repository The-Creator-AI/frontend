import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Code-Chat.scss';
import Arena from './components/arena/Arena';
import Tips from './components/tips/Tips';
import useStore from '../../state/useStore';
import { codeChatStore$ } from './store/code-chat.store';
import { fetchSavedChats, fetchSavedPlans } from './store/code-chat-store.logic';


function CodeChat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPath } = useStore(codeChatStore$);

  useEffect(() => {
    const paramsObject = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...paramsObject, path: currentPath });
    fetchSavedPlans();
    fetchSavedChats();
  }, [currentPath, searchParams, setSearchParams]);

  return (
    <div className="CodeChat">
      <Tips />
      <Arena />
    </div>
  );
}

export default CodeChat;
