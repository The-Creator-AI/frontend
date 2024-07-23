import React from "react";
import { List, Typography, Popconfirm, message } from "antd";
import { codeChatStore$ } from "../../../store/code-chat.store";
import useStore from "../../../../../state/useStore";
import { v4 as uuidv4 } from "uuid";
import "./SavedChats.scss";
import { updateChatHistory } from "../../../store/code-chat-store.logic";
import { ChatMessageType, ChatType } from "@The-Creator-AI/fe-be-common/dist/types";
import { deleteChat } from '../../../store/code-chat-store.logic';
import { DeleteOutlined } from '@ant-design/icons';

interface SavedChatsProps {
}

const SavedChats: React.FC<SavedChatsProps> = () => {
    const { savedChats } = useStore(codeChatStore$);

    // Function to handle clicking on a saved chat
    const handleChatClick = (chat: ChatType) => {
        updateChatHistory(chat.chat_history); // Update chat history with the chat
    };

    // Function to handle deleting a saved chat
    const handleDeleteChat = async (id: number) => {
        try {
            await deleteChat(id);
            message.success("Chat deleted successfully!");
        } catch (error) {
            console.error("Error deleting chat:", error);
            message.error("Failed to delete chat.");
        }
    };

    return (
        <List
            itemLayout="horizontal"
            dataSource={savedChats}
            renderItem={(item) => (
                <List.Item
                    className="saved-chat-item"
                    onClick={(e) => {
                        console.log({ e });
                        // Prevent handleChatClick from being called when clicking the delete icon
                        if ((e.target as HTMLElement).parentElement?.classList.contains('delete-chat')) {
                            return;
                        }
                        handleChatClick(item);
                    }}
                >
                    <List.Item.Meta
                        title={<Typography.Text className="saved-chat-title" title={item.title}>{item.title}</Typography.Text>}
                    // description={item.description}
                    />
                    {/* Delete button with confirmation */}
                    <Popconfirm
                        title="Are you sure delete this chat?"
                        onConfirm={(e) => {
                            e?.stopPropagation();
                            e?.preventDefault();
                            item.id && handleDeleteChat(item.id);
                        }}
                        onCancel={() => { }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <DeleteOutlined className="delete-chat"/>
                    </Popconfirm>
                </List.Item>
            )}
        />
    );
};

export default SavedChats;
