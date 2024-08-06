import MonacoEditor from "@monaco-editor/react";
import { Button, Modal, Typography } from "antd";
import React from "react";
// import "./CodeFile.modal.scss";

interface CodeFileProps {
    name: string;
    code: string;
    onClose: () => void;
    height?: number;
}

const CodeFile: React.FC<CodeFileProps> = ({ name, code, onClose, height }) => {
    return (
        <div className="code-file-modal" onClick={(e) => e.stopPropagation()}>
            <div className="code-file-modal-inner">
                <div className="code-file-header">
                    <Typography.Text className="code-file-title" title={name}>
                        {name}
                    </Typography.Text>
                    <Button type="link" onClick={onClose} className="close-button">
                        Close
                    </Button>
                </div>
                <div className="code-file-content">
                    <MonacoEditor
                        height={height || 600}
                        width="100%"
                        value={code || ""}
                        // language="json"
                        theme="vs-dark"
                        options={{
                            readOnly: false,
                        }}
                        path={name}
                    />
                </div>
            </div>
        </div>
    );
};

export default CodeFile;