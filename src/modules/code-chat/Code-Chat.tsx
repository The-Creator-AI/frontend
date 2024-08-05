import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Code-Chat.scss';
import Arena from './components/arena/Arena';
import Tips from './components/tips/Tips';
import useStore from '../../state/useStore';
import { codeChatStoreStateSubject } from './store/code-chat.store';
import { fetchAgents, fetchSavedChats, fetchSavedPlans } from './store/code-chat.logic';
import * as Modals from './components/modals';


function CodeChat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentPath, openModals } = useStore(codeChatStoreStateSubject);

  useEffect(() => {
    const paramsObject = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...paramsObject, path: currentPath });
    fetchSavedPlans();
    fetchSavedChats();
    fetchAgents();
  }, [currentPath, searchParams, setSearchParams]);

  return (
    <div className="CodeChat">
      <Tips />
      <Arena />
      {openModals?.map((modal, index) => {
        const Modal = Modals[modal.type];
        return <Modal key={index} {...modal.props} />;
      })}
    </div>
  );
}

export default CodeChat;
