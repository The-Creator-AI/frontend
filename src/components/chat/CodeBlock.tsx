import React, { useState } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { message } from 'antd';

const CodeBlock = ({ children, className }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(children).then(() => {
            setCopied(true);
            message.success('Code copied to clipboard!');
            setTimeout(() => setCopied(false), 1500); // Reset after 1.5 seconds
        });
    };

    return (
        <pre className={className}>
            <span className="copy-icon" onClick={handleCopy}>
                <CopyOutlined style={{ fontSize: '16px', color: copied ? '#1890ff' : '#888' }} />
            </span>
            <code>{children}</code>
        </pre>
    );
};

export default CodeBlock;