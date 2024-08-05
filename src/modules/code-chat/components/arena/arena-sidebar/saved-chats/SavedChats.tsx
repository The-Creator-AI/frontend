import { ChatType } from "@The-Creator-AI/fe-be-common/dist/types";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Input, List, Popconfirm, Typography, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import useStore from "../../../../../../state/useStore";
import {
  deleteChat,
  saveChat,
  updateChatHistory,
  updateStage,
} from "../../../../store/code-chat.logic";
import { codeChatStoreStateSubject, getChatIdForFirstChat } from "../../../../store/code-chat.store";
import "./SavedChats.scss";

interface SavedChatsProps {}

const SavedChats: React.FC<SavedChatsProps> = () => {
  const { savedChats, stage } = useStore(codeChatStoreStateSubject);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [newChatTitle, setNewChatTitle] = useState<string>("");
  const inputRef = useRef(null);

useEffect(() => {
    // On Esc key press, clear the editing state
    const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setEditingChatId(null);
            setNewChatTitle("");
        }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
        document.removeEventListener("keydown", handleEscapeKey);
    }
}, []);

useEffect(() => {
    if (inputRef.current) {
        (inputRef.current as HTMLInputElement).focus();
    }
}, [editingChatId]);

  // Function to handle clicking on a saved chat
  const handleChatClick = (chat: ChatType) => {
    updateChatHistory(getChatIdForFirstChat(), chat.chat_history);
    updateStage({
      stage: { type: 'chat', activeChatId: chat.id, title: chat.title },
      breadcrumb: { items: [{ label: 'Chats', href: '/chats' }, { label: chat.title, href: `/${chat.id}` }] },
    });
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

  // Function to handle renaming a saved chat
  const handleRenameChat = async (item: ChatType) => {
    try {
      if (item.id && newChatTitle !== item.title) {
        await saveChat({ ...item, title: newChatTitle });
        message.success("Chat renamed successfully!");
      }
    } catch (error) {
      console.error("Error renaming chat:", error);
      message.error("Failed to rename chat.");
    } finally {
      setEditingChatId(null);
      setNewChatTitle("");
    }
  };

  // Function to handle editing the chat title
  const handleEditChatTitle = (id: number, title: string) => {
    setEditingChatId(id);
    setNewChatTitle(title);
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={savedChats}
      renderItem={(item) => (
        <List.Item
          className="saved-chat-item"
          onClick={(e) => {
            // Prevent handleChatClick from being called when clicking the delete/rename icon
            if (
              (e.target as HTMLElement).parentElement?.classList.contains(
                "delete-chat"
              ) ||
              (e.target as HTMLElement).parentElement?.classList.contains(
                "edit-chat"
              )
            ) {
              return;
            }
            handleChatClick(item);
          }}
        >
          <List.Item.Meta
            title={
              editingChatId === item.id ? (
                // If editing, show the input field
                <Input
                  ref={inputRef}
                  type="text"
                  className="saved-chat-title-input"
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  onBlur={() => handleRenameChat(item)}
                  // on enter
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameChat(item);
                    }
                  }}
                />
              ) : (
                // Otherwise, show the chat title
                <Typography.Text
                  className={`saved-chat-title ${stage?.type === "chat" && stage.activeChatId === item.id ? "active-chat-item" : ""}`}
                  title={item.title}
                >
                  {item.title}
                </Typography.Text>
              )
            }
            // description={item.description}
          />
          {/* Rename button with confirmation */}
          <span
            className="rename-chat"
            onClick={() => item.id && handleEditChatTitle(item.id, item.title)}
          >
            <EditOutlined className="edit-chat" />
          </span>
          {/* Delete button with confirmation */}
          <Popconfirm
            title="Are you sure delete this chat?"
            onConfirm={(e) => {
              e?.stopPropagation();
              e?.preventDefault();
              item.id && handleDeleteChat(item.id);
            }}
            onCancel={() => {}}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined className="delete-chat" />
          </Popconfirm>
        </List.Item>
      )}
    />
  );
};

export default SavedChats;
