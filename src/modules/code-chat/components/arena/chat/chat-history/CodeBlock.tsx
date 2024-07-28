import React, { useMemo, useState } from 'react';
import { CopyOutlined, SaveOutlined } from '@ant-design/icons';
import { message } from 'antd';
import PlanDisplay from "./plan/PlanDisplay";
import CodePlanDisplay from './code-plan/CodePlanDisplay';
import './CodeBlock.scss';

const CodeBlock = ({ children, className, node, onSave }) => {
    const [copied, setCopied] = useState(false);
    const isJson = node?.properties?.className?.includes('language-json');
    const jsonCode = useMemo(() => {
        try {
            return isJson ? JSON.parse(children) : null;
        } catch (error) {
            return null;
        }
    }, [children]);

    const handleCopy = () => {
        navigator.clipboard.writeText(children).then(() => {
            setCopied(true);
            message.success('Code copied to clipboard!');
            setTimeout(() => setCopied(false), 1500); // Reset after 1.5 seconds
        });
    };

    const renderDefaultContent = () => {
        return <pre className={className}>
        <span className="copy-icon" onClick={handleCopy}>
            <CopyOutlined style={{ fontSize: '22px', color: copied ? '#1890ff' : '#888' }} />
        </span>
        <span className='save-icon' onClick={onSave}>
            <SaveOutlined style={{
                fontSize: '22px',
            }} title="Save code to file"/>
        </span>
        <code>{children}</code>
    </pre>;
    };

    const renderContent = () => {
        if (jsonCode) {
            if (jsonCode.plan_title) {
                return <PlanDisplay plan={jsonCode} /> ;
            }

            if (jsonCode.code_plan) {
                return <CodePlanDisplay plan={jsonCode} />;
            }

            if (jsonCode.acceptance_criteria) {
                return renderDefaultContent();
            }

            return renderDefaultContent();
        }
        return renderDefaultContent();
    }

    return renderContent();
};

export default React.memo(CodeBlock);