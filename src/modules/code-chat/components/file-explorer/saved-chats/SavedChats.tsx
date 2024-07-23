import React from 'react';
import { List, Typography } from 'antd';
import { codeChatStore$ } from '../../../store/code-chat.store';
import useStore from '../../../../../state/useStore';
import { v4 as uuidv4 } from 'uuid';
import './SavedChats.scss';
import { updateChatHistory } from '../../../store/code-chat-store.logic';
import { ChatMessageType, ChatType } from "@The-Creator-AI/fe-be-common/dist/types";

interface SavedChatsProps {
}

const SavedChats: React.FC<SavedChatsProps> = () => {
    const { savedChats } = useStore(codeChatStore$);

    // Function to handle clicking on a saved chat
    const handleChatClick = (chat: ChatType) => {
        updateChatHistory(chat.chat_history); // Update chat history with the chat
    };

    return (
        <List
            itemLayout="horizontal"
            dataSource={savedChats}
            renderItem={(item) => (
                <List.Item
                    className="saved-chat-item"
                    onClick={() => handleChatClick(item)}
                >
                    <List.Item.Meta
                        title={<Typography.Text className="saved-chat-title" title={item.title}>{item.title}</Typography.Text>}
                    // description={item.description}
                    />
                </List.Item>
            )}
        />
    );
};

export default SavedChats;
