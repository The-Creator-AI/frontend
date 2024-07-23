import React from "react";
import { List, Popconfirm, Typography, message } from "antd";
import { codeChatStore$ } from "../../../store/code-chat.store";
import useStore from "../../../../../state/useStore";
import { v4 as uuidv4 } from "uuid";
import './SavedPlans.scss';
import { deletePlan, updateChatHistory } from "../../../store/code-chat-store.logic";
import { ChatMessageType, PlanType } from "@The-Creator-AI/fe-be-common/dist/types";
import { DeleteOutlined } from '@ant-design/icons';

interface SavedPlansProps {
}

const SavedPlans: React.FC<SavedPlansProps> = () => {
    const { savedPlans } = useStore(codeChatStore$);

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
                message: `\`\`\`json\n${typeof plan === 'string' ? plan : JSON.stringify(plan, null, 2)}\n\`\`\``,
                model: "gpt-3.5-turbo",
                uuid: uuidv4(),
            },
        ];

        updateChatHistory(chatHistory); // Update chat history with the plan
    };


    // Function to handle deleting a saved plan
    const handleDeletePlan = async (id: number) => {
        try {
            await deletePlan(id);
            message.success("Chat deleted successfully!");
        } catch (error) {
            console.error("Error deleting chat:", error);
            message.error("Failed to delete chat.");
        }
    };

    return (
        <List
            itemLayout="horizontal"
            dataSource={savedPlans}
            renderItem={(item) => (
                <List.Item
                    className="saved-plan-item"
                    onClick={(e) => {
                        // Prevent handlePlanClick from being called when clicking the delete icon
                        if ((e.target as HTMLElement).parentElement?.classList.contains('delete-plan')) {
                            return;
                        }
                        handlePlanClick(item);
                    }}
                >
                    <List.Item.Meta
                        title={<Typography.Text className="saved-plan-title" title={item.title}>{item.title}</Typography.Text>}
                    // description={item.description}
                    />
                    {/* Delete button with confirmation */}
                    <Popconfirm
                        title="Are you sure delete this plan?"
                        onConfirm={(e) => {
                            e?.stopPropagation();
                            e?.preventDefault();
                            item.id && handleDeletePlan(item.id);
                        }}
                        onCancel={() => { }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <DeleteOutlined className="delete-plan"/>
                    </Popconfirm>
                </List.Item>
            )}
        />
    );
};

export default SavedPlans;
