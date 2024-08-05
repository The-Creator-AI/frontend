import React from 'react';
import './ArenaNavHeader.scss';
import { codeChatStoreStateSubject } from '../../../store/code-chat.store';
import useStore from '../../../../../state/useStore';

const ArenaNavHeader: React.FC = () => {
  const { breadcrumb } = useStore(codeChatStoreStateSubject);

  return (
    <header className="arena-nav-header">
      <ul className="breadcrumb">
        {breadcrumb?.items.map((item, index) => (
          <li key={index}>
            <div
                className={`breadcrumb-link ${item.disabled ? 'disabled' : ''}`}
                onClick={item.disabled ? undefined : item.onClick}
                style={{
                    fontWeight: breadcrumb.items.length - 1 === index ? 'bold' : 'normal',
                    color: item.onClick ? 'black' : 'gray',
                }}
                >
                {item.label}
            </div>
            {index < breadcrumb.items.length - 1 && (
              <span className='separator'>/</span>
            )}
          </li>
        ))}
      </ul>
    </header>
  );
};

export default ArenaNavHeader;
