import {
    ChatMessageType,
    PlanType,
} from "@The-Creator-AI/fe-be-common/dist/types";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Input, List, Popconfirm, Typography, message } from "antd";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import useStore from "../../../../../state/useStore";
import {
    deletePlan,
    savePlan,
    updateChatHistory,
    updateFileContentPopup,
} from "../../../store/code-chat-store.logic";
import { codeChatStore$ } from "../../../store/code-chat.store";
import "./SavedPlans.scss";

interface SavedPlansProps { }

const SavedPlans: React.FC<SavedPlansProps> = () => {
    const { savedPlans } = useStore(codeChatStore$);

    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
    const [newPlanTitle, setNewPlanTitle] = useState<string>("");

    useEffect(() => {
        // On Esc key press, clear the editing state
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setEditingPlanId(null);
                setNewPlanTitle("");
            }
        };
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        }
    }, []);

    // Function to handle clicking on a saved plan
    const handlePlanClick = (plan: PlanType) => {
        const chatHistory: ChatMessageType[] = [
            // Add an instruction for the AI agent
            {
                user: "instructor",
                message: `Please load the following saved plan:`,
                agentName: "Code Plan",
                uuid: uuidv4(),
            },
            // Add the plan content in JSON format
            {
                user: "bot",
                message: `\`\`\`json\n${typeof plan === "string" ? plan : JSON.stringify(plan, null, 2)
                    }\n\`\`\``,
                model: "gpt-3.5-turbo",
                uuid: uuidv4(),
            },
        ];

        updateChatHistory(chatHistory); // Update chat history with the plan
    };

    // Function to handle renaming a saved plan
    const handleRenamePlan = async (item: PlanType) => {
        try {
            if (item.id && newPlanTitle !== item.title) {
                await savePlan({ ...item, title: newPlanTitle });
                message.success("Plan renamed successfully!");
            }
        } catch (error) {
            console.error("Error renaming plan:", error);
            message.error("Failed to rename plan.");
        } finally {
            setEditingPlanId(null);
            setNewPlanTitle("");
        }
    };

    // Function to handle editing the plan title
    const handleEditPlanTitle = (id: number, title: string) => {
        setEditingPlanId(id);
        setNewPlanTitle(title);
    };

    // Function to handle deleting a saved plan
    const handleDeletePlan = async (id: number) => {
        try {
            await deletePlan(id);
            message.success("Plan deleted successfully!");
        } catch (error) {
            console.error("Error deleting plan:", error);
            message.error("Failed to delete plan.");
        }
    };

    return (
        <List
            className="saved-plans-list"
            itemLayout="horizontal"
            dataSource={savedPlans}
            renderItem={(item: PlanType) => (
                <List.Item
                    className="saved-plan-item"
                    onClick={(e) => {
                        console.log(e.target);
                        // Prevent handlePlanClick from being called when clicking the delete icon
                        if (
                            (e.target as HTMLElement).parentElement?.classList.contains(
                                "delete-plan"
                            ) ||
                            (e.target as HTMLElement).parentElement?.classList.contains(
                                "edit-plan"
                            )
                        ) {
                            return;
                        }
                        handlePlanClick(item);
                    }}
                >
                    <List.Item.Meta
                        title={
                            editingPlanId === item.id ? (
                                <Input
                                    type="text"
                                    className="saved-plan-title-input"
                                    value={newPlanTitle}
                                    onChange={(e) => setNewPlanTitle(e.target.value)}
                                    onBlur={() => handleRenamePlan(item)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleRenamePlan(item);
                                        }
                                    }}
                                />
                            ) : (
                                <Typography.Text
                                    className="saved-plan-title"
                                    title={item.title}
                                >
                                    {item.title}
                                </Typography.Text>
                            )
                        }
                    />
                    {/* Rename button with confirmation */}
                    <span
                        className="rename-plan"
                        onClick={() => item.id && handleEditPlanTitle(item.id, item.title)}
                    >
                        <EditOutlined className="edit-plan" />
                    </span>
                    {/* <List.Item.Meta description={item.description} /> */}
                    {/* Delete button with confirmation */}
                    <Popconfirm
                        title="Are you sure delete this plan?"
                        onConfirm={(e) => {
                            e?.stopPropagation();
                            e?.preventDefault();
                            item.id && handleDeletePlan(item.id);
                        }}
                        onCancel={() => { }}
                        okText="Delete"
                        cancelText="Cancel"
                    >
                        <DeleteOutlined className="delete-plan" />
                    </Popconfirm>
                </List.Item>
            )}
        />
    );
};

export default SavedPlans;
