import React, { useEffect, useRef, useState } from "react";
import { List, Popconfirm, Typography, message, Button, Input } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Agent } from "../../../../../../types/agent.type";
import useStore from "../../../../../../state/useStore";
import { codeChatStore$ } from "../../../../store/code-chat.store";
import {
    updateSelectedAgent,
} from "../../../../store/code-chat-store.logic";
import { sendMessage } from "../../../../../gateway/store/gateway.logic";
import "./AgentsSettings.scss";
import MonacoEditor from "@monaco-editor/react";
import { updateStage } from "../../../../store/code-chat-store.logic";
import { ToServer } from "@The-Creator-AI/fe-be-common";

interface AgentsSettingsProps { }

const AgentsSettings: React.FC<AgentsSettingsProps> = () => {
    const { agents } = useStore(codeChatStore$);
    const [editingAgent, setEditingAgent] = useState<Partial<Agent> & { editable: boolean } | null>(null);
    const [newAgentName, setNewAgentName] = useState<string>("");
    const [newAgentSystemInstructions, setNewAgentSystemInstructions] =
        useState<string>("");
    const inputRef = useRef(null);

    useEffect(() => {
        // Fetch agents when the component mounts
        sendMessage(ToServer.GET_AGENTS, {});
    }, []);

    // Handle clicking on an agent
    const handleAgentClick = (agent: Agent) => {
        updateSelectedAgent(agent);
    };

    // Handle deleting an agent
    const handleDeleteAgent = async (id: string) => {
        try {
            await sendMessage(ToServer.DELETE_AGENT, { id });
            message.success("Agent deleted successfully!");
        } catch (error) {
            console.error("Error deleting agent:", error);
            message.error("Failed to delete agent.");
        }
    };

    // Handle renaming an agent
    const handleRenameAgent = async (agent: Agent) => {
        try {
            if (agent.id && newAgentName !== agent.name) {
                await sendMessage(ToServer.SAVE_AGENT, {
                    ...agent,
                    name: newAgentName,
                    systemInstructions: newAgentSystemInstructions,
                });
                message.success("Agent renamed successfully!");
            }
        } catch (error) {
            console.error("Error renaming agent:", error);
            message.error("Failed to rename agent.");
        } finally {
            setEditingAgent(null);
            setNewAgentName("");
            setNewAgentSystemInstructions("");
        }
    };

    // Handle editing the agent's details
    const handleEditAgent = (agent: Agent & { editable: boolean }) => {
        setEditingAgent(agent);
        setNewAgentName(agent.name);
        setNewAgentSystemInstructions(agent.systemInstructions);
        updateStage({ type: "settings", pageId: "agent-editor", agentId: agent.id }); // Open Monaco editor for agent editing
    };

    // Function to update the system instructions in the Monaco editor
    const handleMonacoChange = (value?: string) => {
        value && setNewAgentSystemInstructions(value);
    };

    return (
        <div className="agents-settings-container">
            <List
                itemLayout="horizontal"
                dataSource={agents}
                renderItem={(item) => (
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
                        // description={item.systemInstructions}
                        />
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
            <Button type="primary" onClick={() => setEditingAgent({ name: "new agent", editable: true, systemInstructions: '' })}>
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
                        // onBlur={() => handleRenameAgent(editingAgent)}
                        // onKeyDown={(e) => {
                        //     if (e.key === "Enter") {
                        //         handleRenameAgent(editingAgent);
                        //     }
                        // }}
                    />
                    <MonacoEditor
                        //   ref={monacoRef} // Add the ref to the Monaco editor component
                        height="600px"
                        width="100%"
                        value={newAgentSystemInstructions}
                        language="json"
                        theme="vs-dark"
                        onChange={handleMonacoChange}
                        options={{
                            readOnly: !editingAgent?.editable, // Set to false for editing
                            // ...other Monaco editor options
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
};

export default AgentsSettings;

