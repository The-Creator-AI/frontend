import React, { useState, useCallback, useMemo } from 'react';
import { Button, Input, message, Tooltip } from 'antd';
import { CopyOutlined, FileTextFilled, FileTextOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import useStore from '../../../../../../../state/useStore';
import { closeModal, openModal, saveCodeToFileFromDeveloperResponse } from '../../../../../store/code-chat-store.logic';
import { codeChatStore$, getChatIdForNewChat, getCurrentPath, getFirstChat } from '../../../../../store/code-chat.store';
import useChat from '../../useChat';
import './CodePlanDisplay.scss';
import { chatTitleForCode, chatTitleForRecommendations, fileCode, isFileCodeLoading, parseDeveloperResponse, promptForCodeFile, promptForRecommendations } from './CodePlanDisplay.utils';
import RecommendationItem from './components/RecommendationItem';

interface CodeStep {
    filename: string;
    recommendations: string[];
}

interface CommandStep {
    command: string;
    description: string;
}

interface CodePlanDisplayProps {
    plan: {
        title: string;
        description: string;
        code_plan: (CodeStep | CommandStep)[];
    };
}

const CodePlanDisplay: React.FC<CodePlanDisplayProps> = ({ plan }) => {
    const { agents, selectedFiles } = useStore(codeChatStore$);
    const { sendMessage } = useChat();
    const [recommendations, setRecommendations] = useState<string[][]>(
        plan.code_plan.map((step) => 'recommendations' in step ? step.recommendations : [])
    );
    const [editingIndices, setEditingIndices] = useState<[number, number] | null>(null);

    const codePlanAgent = useMemo(() => agents?.find((agent) => agent.name === "Code Plan"), [agents]);
    const developerAgent = useMemo(() => agents?.find((agent) => agent.name === "Developer"), [agents]);

    const handleMoreRecommendations = useCallback((filename: string) => {
        sendMessage({
            chatId: getChatIdForNewChat(),
            chatTitle: chatTitleForRecommendations(filename),
            agentInstruction: codePlanAgent?.systemInstructions,
            agentName: codePlanAgent?.name,
            message: promptForRecommendations(filename),
            selectedFiles: selectedFiles.map((filePath) => `${getCurrentPath()}/${filePath}`),
            chatHistory: getFirstChat()?.chat_history
        });
    }, [codePlanAgent, sendMessage, selectedFiles]);

    const handleGetCode = useCallback((filename: string) => {
        sendMessage({
            chatId: getChatIdForNewChat(),
            chatTitle: chatTitleForCode(filename),
            agentInstruction: developerAgent?.systemInstructions,
            agentName: developerAgent?.name,
            message: promptForCodeFile(filename),
            selectedFiles: selectedFiles.map((filePath) => `${getCurrentPath()}/${filePath}`),
            chatHistory: getFirstChat()?.chat_history
        });
    }, [developerAgent, sendMessage, selectedFiles]);

    const handleEditRecommendation = useCallback((indices: [number, number], recommendation: string) => {
        setEditingIndices(indices);
        setRecommendations((prev) => {
            const updated = [...prev];
            updated[indices[0]][indices[1]] = recommendation;
            return updated;
        });
    }, []);

    const handleSaveRecommendation = useCallback((indices: [number, number], newRecommendation: string) => {
        setEditingIndices(null);
        setRecommendations((prev) => {
            const updated = [...prev];
            updated[indices[0]][indices[1]] = newRecommendation;
            return updated;
        });
        // TODO: Implement backend update logic here
    }, []);

    const handleDeleteRecommendation = useCallback((indices: [number, number]) => {
        setRecommendations((prev) => {
            const updated = [...prev];
            updated[indices[0]].splice(indices[1], 1);
            return updated;
        });
    }, []);

    const handleAddRecommendation = useCallback((indices: [number, number]) => {
        setRecommendations((prev) => {
            const updated = [...prev];
            updated[indices[0]].push("");
            setEditingIndices([indices[0], updated[indices[0]].length - 1]);
            return updated;
        });
    }, []);

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success('Code copied to clipboard!');
        });
    }, []);

    const renderCodeStep = useCallback((step: CodeStep, stepIndex: number) => (
        <li key={stepIndex} className="recommendation">
            <div className="recommendation-description">
                <div className="filename" title={step.filename}>
                    <div className='name'>{step.filename?.split('/').pop()}</div>
                    <div className='path'>
                        {step.filename.split('/').slice(0, -1).join('/')}/
                    </div>
                </div>
                <div className='actions'>
                    <Tooltip title="More detailed">
                        <Button
                            type="link"
                            icon={<PlusOutlined />}
                            onClick={() => handleMoreRecommendations(step.filename)}
                            className="more-recommendations-button"
                        />
                    </Tooltip>
                    <Tooltip title={isFileCodeLoading(step.filename) ? "Loading..." : fileCode(step.filename) ? "View Code" : "Get Code"}>
                        <Button
                            type="link"
                            icon={fileCode(step.filename) ? <FileTextFilled /> : <FileTextOutlined />}
                            loading={isFileCodeLoading(step.filename)}
                            onClick={() => handleCodeButtonClick(step.filename)}
                            className="get-code-button"
                        />
                    </Tooltip>
                </div>
            </div>
            <div className="recommendation-items">
                {recommendations[stepIndex].map((recommendation, recIndex) => (
                    <RecommendationItem
                        key={recIndex}
                        recommendation={recommendation}
                        isEditing={editingIndices?.[0] === stepIndex && editingIndices[1] === recIndex}
                        onEdit={(value) => handleEditRecommendation([stepIndex, recIndex], value)}
                        onSave={(value) => handleSaveRecommendation([stepIndex, recIndex], value)}
                        onDelete={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteRecommendation([stepIndex, recIndex]);
                        }}
                        onCancel={() => setEditingIndices(null)}
                    />
                ))}
                <div className='add-button'
                onClick={() => handleAddRecommendation([stepIndex, recommendations[stepIndex].length])}>
                    <PlusOutlined />
                    Add
                </div>
            </div>
        </li>
    ), [recommendations, editingIndices, handleMoreRecommendations, handleEditRecommendation, handleSaveRecommendation, handleDeleteRecommendation, handleAddRecommendation]);

    const renderCommandStep = useCallback((step: CommandStep, stepIndex: number) => (
        <li key={stepIndex} className="command">
            <span className="command-code">{step.command}</span>
            <Tooltip title="Copy Command">
                <Button
                    type="link"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(step.command)}
                    className="get-code-button"
                />
            </Tooltip>
        </li>
    ), [handleCopy]);

    const handleCodeButtonClick = useCallback((filename: string) => {
        if (fileCode(filename)) {
            openModal('CodeFileModal', {
                name: filename,
                code: parseDeveloperResponse(fileCode(filename)).code || '',
                onApply: () => {
                    const parsedMessage = parseDeveloperResponse(fileCode(filename));
                    saveCodeToFileFromDeveloperResponse({
                        ...parsedMessage,
                        filePath: parsedMessage.filePath || filename
                    }, getCurrentPath());
                    closeModal('CodeFileModal');
                },
                onClose: () => closeModal('CodeFileModal'),
            });
        } else {
            handleGetCode(filename);
        }
    }, [handleGetCode]);

    return (
        <div className="code-plan-display">
            <div className="header">
                <h2 className="code-plan-title">{plan.title}</h2>
                <p className="code-plan-summary">{plan.description}</p>
            </div>
            <ul className="recommendations">
                {plan.code_plan.map((step, index) =>
                    'filename' in step ? renderCodeStep(step, index) : renderCommandStep(step, index)
                )}
            </ul>
        </div>
    );
};


export default React.memo(CodePlanDisplay);
