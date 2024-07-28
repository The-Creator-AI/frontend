import MonacoEditor from "@monaco-editor/react";
import { Button, Modal, Typography } from "antd";
import React from "react";
import "./CodeFile.modal.scss";

interface CodeFileModalProps {
    isOpen: boolean;
    name: string;
    code: string;
    onApply: () => void;
    onClose: () => void;
}

const CodeFileModal: React.FC<CodeFileModalProps> = ({
    isOpen,
    name,
    code,
    onApply,
    onClose
}) => {
    return (
        <Modal
            title={<Typography.Text title={name || "Code File"}>
                {name || "Code File"}
            </Typography.Text>}
            open={isOpen}
            onCancel={onClose}
            width={1200}
            footer={[
                <Button key="back" onClick={onClose}>
                    Close
                </Button>,
                <Button key="submit" type="primary" onClick={onApply}>
                    Apply
                </Button>,
            ]}
        >
            <div className="code-file-editor">
                <MonacoEditor
                    height="600px"
                    width="100%"
                    value={code || ""}
                    language="json"
                    theme="vs-dark"
                    options={{
                        readOnly: false,
                    }}
                />
            </div>
        </Modal>
    );
};

export default CodeFileModal;

