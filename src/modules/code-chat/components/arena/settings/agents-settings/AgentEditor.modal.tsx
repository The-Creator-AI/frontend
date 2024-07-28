import { Button, Input, Modal, Typography } from "antd";
import React, { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import "./AgentEditor.modal.scss";
import { AgentType } from "@The-Creator-AI/fe-be-common/dist/types";

interface AgentEditorModalProps {
    isOpen: boolean;
    agent: Omit<AgentType, 'id'> | null;
    name: string;
    systemInstructions: string;
    onSave: () => void;
    onClose: () => void;
    onNameChange: (name: string) => void;
    onSystemInstructionsChange: (value: string) => void;
}

const AgentEditorModal: React.FC<AgentEditorModalProps> = ({
    isOpen,
    agent,
    name,
    systemInstructions,
    onSave,
    onClose,
    onNameChange,
    onSystemInstructionsChange,
}) => {
    return (
        <Modal
            title={<Typography.Text className="agents-settings-title" title={agent?.name || "New Agent"}>
                {agent?.name || "New Agent"}
            </Typography.Text>}
            open={isOpen}
            onCancel={onClose}
            width={1200}
            footer={[
                <Button key="back" onClick={onClose}>
                    Close
                </Button>,
                <Button key="submit" type="primary" onClick={onSave}>
                    Save
                </Button>,
            ]}
        >
            <div className="agent-editor-form">
                <Input
                    type="text"
                    value={name}
                    placeholder="Agent Name"
                    onChange={(e) => onNameChange(e.target.value)}
                />
                <MonacoEditor
                    height="600px"
                    width="100%"
                    value={systemInstructions}
                    language="json"
                    theme="vs-dark"
                    onChange={onSystemInstructionsChange as any}
                    options={{
                        readOnly: !(agent?.editable ?? true), // Set to false for editing
                    }}
                />
            </div>
        </Modal>
    );
};

export default AgentEditorModal;

