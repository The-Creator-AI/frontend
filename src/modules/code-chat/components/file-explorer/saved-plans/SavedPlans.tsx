import React from "react";
import { List, Typography } from "antd";
import { codeChatStore$ } from "../../../store/code-chat.store";
import useStore from "../../../../../state/useStore";
import { v4 as uuidv4 } from "uuid";
import './SavedPlans.scss';
import { updateChatHistory } from "../../../store/code-chat-store.logic";
import { ChatMessageType, PlanType } from "@The-Creator-AI/fe-be-common/dist/types";

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

    return (
        <List
            itemLayout="horizontal"
            dataSource={savedPlans}
            renderItem={(item) => (
                <List.Item
                    className="saved-plan-item"
                    onClick={() => handlePlanClick(item)}
                >
                    <List.Item.Meta
                        title={<Typography.Text className="saved-plan-title" title={item.title}>{item.title}</Typography.Text>}
                    // description={item.description}
                    />
                </List.Item>
            )}
        />
    );
};

export default SavedPlans;

