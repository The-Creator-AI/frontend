import { ToServer } from "@The-Creator-AI/fe-be-common";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import MonacoEditor from "@monaco-editor/react";
import { Button, Input, List, Popconfirm, Typography, message, Radio } from "antd"; // Import Radio from Ant Design
import React, { useEffect, useRef, useState } from "react";
import useStore from "../../../../../../state/useStore";
import { sendMessage } from "../../../../../gateway/store/gateway.logic";
import {
    saveAgent,
    updateSelectedAgent,
} from "../../../../store/code-chat-store.logic";
import { codeChatStore$ } from "../../../../store/code-chat.store";
import "./AgentsSettings.scss";
import { AgentType } from "@The-Creator-AI/fe-be-common/dist/types";

// Interface for the props of the AgentsSettings component
interface AgentsSettingsProps { }

// Functional component for the AgentsSettings
const AgentsSettings: React.FC<AgentsSettingsProps> = () => {
    // Use custom hook to get the state of agents from the store
    const { agents } = useStore(codeChatStore$);

    // State variables for managing the current editing agent, new agent name, and instructions
    const [editingAgent, setEditingAgent] = useState<Omit<AgentType, 'id'> | null>(null);
    const [newAgentName, setNewAgentName] = useState<string>("");
    const [newAgentSystemInstructions, setNewAgentSystemInstructions] = useState<string>("");
    const inputRef = useRef(null);

    // Fetch agents when the component mounts
    useEffect(() => {
        sendMessage(ToServer.GET_AGENTS, {});
    }, []);

    // Handle clicking on an agent to update the selected agent in the store
    const handleAgentClick = (agent: AgentType) => {
        updateSelectedAgent(agent);
    };

    // Handle deleting an agent by sending a DELETE_AGENT message
    const handleDeleteAgent = async (id: number) => {
        try {
            await sendMessage(ToServer.DELETE_AGENT, { id });
            message.success("Agent deleted successfully!");
        } catch (error) {
            console.error("Error deleting agent:", error);
            message.error("Failed to delete agent.");
        }
    };

    // Handle editing an agent's details
    const handleEditAgent = (agent: AgentType) => {
        setEditingAgent(agent);
        setNewAgentName(agent.name);
        setNewAgentSystemInstructions(agent.systemInstructions);
    };

    // Update the system instructions using the Monaco editor
    const handleMonacoChange = (value?: string) => {
        value && setNewAgentSystemInstructions(value);
    };

    // Handle changing the hidden state of an agent
    const handleHiddenChange = async (agent: AgentType, hidden: boolean) => {
        try {
            await saveAgent({
                ...agent,
                hidden,
            });
            message.success(`Agent ${hidden ? "hidden" : "visible"} successfully!`);
        } catch (error) {
            console.error("Error updating agent visibility:", error);
            message.error("Failed to update agent visibility.");
        }
    };

    return (
        <div className="agents-settings-container">
            <List
                itemLayout="horizontal"
                dataSource={agents}
                renderItem={(item: AgentType) => (
                    <List.Item
                        className="agents-settings-item"
                        onClick={() => handleAgentClick(item)}
                    >
                        <List.Item.Meta
                            title={
                                <Typography.Text
                                    className="agents-settings-title"
                                    title={item.name}
                                >
                                    {item.name}
                                </Typography.Text>
                            }
                        />
                        <Radio.Group
                            onChange={(e) => handleHiddenChange(item, e.target.value)}
                            value={item.hidden}
                            style={{ marginRight: 8 }} // Add some margin
                        >
                            <Radio value={false}>Visible</Radio>
                            <Radio value={true}>Hidden</Radio>
                        </Radio.Group>
                        <span
                            className="edit-agent"
                            onClick={() => item.id && handleEditAgent(item)}
                        >
                            <EditOutlined />
                        </span>
                        <Popconfirm
                            title="Are you sure delete this agent?"
                            onConfirm={(e) => {
                                e?.stopPropagation();
                                e?.preventDefault();
                                item.id && handleDeleteAgent(item.id);
                            }}
                            onCancel={() => { }}
                            okText="Yes"
                            cancelText="No"
                        >
                            <DeleteOutlined className="delete-agent" />
                        </Popconfirm>
                    </List.Item>
                )}
            />
            {/* Button to add new agent */}
            <Button
                type="primary"
                onClick={() =>
                    setEditingAgent({ name: "new agent", editable: true, systemInstructions: '' })
                }
            >
                Add New Agent
            </Button>

            {editingAgent ? (
                // If editing, show the input field
                <div>
                    <Input
                        ref={inputRef}
                        type="text"
                        className="agents-settings-name-input"
                        value={newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                    />
                    <MonacoEditor
                        height="600px"
                        width="100%"
                        value={newAgentSystemInstructions}
                        language="json"
                        theme="vs-dark"
                        onChange={handleMonacoChange}
                        options={{
                            readOnly: !editingAgent?.editable, // Set to false for editing
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default AgentsSettings;
