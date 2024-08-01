import React, { useState, useMemo } from 'react';
import { Button, Input, message, Tooltip } from 'antd';
import { CopyOutlined, FileTextFilled, FileTextOutlined, PlusOutlined, MinusOutlined, DeleteOutlined } from '@ant-design/icons';
import useStore from '../../../../../../../state/useStore';
import { closeModal, openModal, saveCodeToFileFromDeveloperResponse } from '../../../../../store/code-chat.logic';
import { codeChatStore$, getChatIdForNewChat, getCurrentPath, getFirstChat } from '../../../../../store/code-chat.store';
import useChat from '../../useChat';
import './CodePlanDisplay.scss';
import { chatTitleForCode, chatTitleForRecommendations, fileCode, isFileCodeLoading, parseDeveloperResponse, promptForCodeFile, promptForRecommendations, updatePlanInChat } from './CodePlanDisplay.utils';
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
    chatId: number;
    messageId: string;
    plan: {
        title: string;
        description: string;
        code_plan: (CodeStep | CommandStep)[];
    };
}

const CodePlanDisplay: React.FC<CodePlanDisplayProps> = ({ plan, chatId, messageId }) => {
    const { agents, selectedFiles } = useStore(codeChatStore$);
    const { sendMessage } = useChat();
    // const [codePlan, setCodePlan] = useState<(CodeStep | CommandStep)[]>(plan.code_plan);
    const recommendations = useMemo(() => plan.code_plan.map((step) => 'recommendations' in step ? step.recommendations : []), [plan.code_plan]);
    const [editingIndices, setEditingIndices] = useState<[number, number] | null>(null);
    const [newStepType, setNewStepType] = useState<'code' | 'command' | null>(null);

    const codePlanAgent = useMemo(() => agents?.find((agent) => agent.name === "Code Plan"), [agents]);
    const developerAgent = useMemo(() => agents?.find((agent) => agent.name === "Developer"), [agents]);

    const handleMoreRecommendations = (filename: string) => {
        sendMessage({
            chatId: getChatIdForNewChat(),
            chatTitle: chatTitleForRecommendations(filename),
            agentInstruction: codePlanAgent?.systemInstructions,
            agentName: codePlanAgent?.name,
            message: promptForRecommendations(filename),
            selectedFiles: selectedFiles.map((filePath) => `${getCurrentPath()}/${filePath}`),
            chatHistory: getFirstChat()?.chat_history
        });
    };

    const handleGetCode = (filename: string) => {
        sendMessage({
            chatId: getChatIdForNewChat(),
            chatTitle: chatTitleForCode(filename),
            agentInstruction: developerAgent?.systemInstructions,
            agentName: developerAgent?.name,
            message: promptForCodeFile(filename),
            selectedFiles: selectedFiles.map((filePath) => `${getCurrentPath()}/${filePath}`),
            chatHistory: getFirstChat()?.chat_history
        });
    };

    const handleEditRecommendation = (indices: [number, number]) => {
        setEditingIndices(indices);
    };

    const handleSaveRecommendation = (indices: [number, number], newRecommendation: string) => {
        setEditingIndices(null);
        const newPlan = {...plan};
        (newPlan.code_plan[indices[0]] as CodeStep).recommendations[indices[1]] = newRecommendation;
        updatePlanInChat(chatId, messageId, newPlan);
    };

    const handleDeleteRecommendation = (indices: [number, number]) => {
        const newPlan = {...plan};
        (plan.code_plan[indices[0]] as CodeStep).recommendations.splice(indices[1], 1);
        updatePlanInChat(chatId, messageId, newPlan);
    };

    const handleAddRecommendation = (indices: [number, number]) => {
        const newPlan = {...plan};
        (newPlan.code_plan[indices[0]] as CodeStep).recommendations.push("");
        updatePlanInChat(chatId, messageId, newPlan);
        // setEditingIndices([indices[0], indices[1]]);
    };

    const handleDeleteStep = (index: number) => {
        const newPlan = {...plan};
        (plan.code_plan).splice(index, 1);
        updatePlanInChat(chatId, messageId, newPlan);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success('Code copied to clipboard!');
        });
    };

    const renderCodeStep = (step: CodeStep, stepIndex: number) => (
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
                    <Tooltip title="Delete Step">
                        <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteStep(stepIndex)}
                            className="delete-step-button"
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
                        onEdit={() => handleEditRecommendation([stepIndex, recIndex])}
                        onSave={(value) => handleSaveRecommendation([stepIndex, recIndex], value)}
                        onDelete={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteRecommendation([stepIndex, recIndex]);
                        }}
                        onCancel={() => handleSaveRecommendation([stepIndex, recIndex], recommendation)}
                    />
                ))}
                <div className='add-button'
                    onClick={() => handleAddRecommendation([stepIndex, recommendations[stepIndex].length])}>
                    <PlusOutlined />
                    Add
                </div>
            </div>
        </li>
    );

    const renderCommandStep = (step: CommandStep, stepIndex: number) => (
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
            <Tooltip title="Delete Step">
                <Button
                    type="link"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteStep(stepIndex)}
                    className="delete-step-button"
                />
            </Tooltip>
        </li>
    );

    const handleCodeButtonClick = (filename: string) => {
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
    };

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
            <div className="add-step-buttons">
                <Button onClick={() => setNewStepType('code')}>Add Code Step</Button>
                <Button onClick={() => setNewStepType('command')}>Add Command Step</Button>
            </div>
            {newStepType === 'code' && (
                <div className="new-step-form">
                    <Input placeholder="Enter filename" onPressEnter={(e) => {
                        const filename = (e.target as HTMLInputElement).value;
                        updatePlanInChat(chatId, messageId, {
                            ...plan,
                            code_plan: [...plan.code_plan, { filename, recommendations: [] }]
                        });
                        // setRecommendations((prev) => [...prev, []]);
                        setNewStepType(null);
                    }} />
                </div>
            )}
            {newStepType === 'command' && (
                <div className="new-step-form">
                    <Input placeholder="Enter command" onPressEnter={(e) => {
                        const command = (e.target as HTMLInputElement).value;
                        updatePlanInChat(chatId, messageId, {
                            ...plan,
                            code_plan: [...plan.code_plan, { command, description: [] }]
                        });
                        setNewStepType(null);
                    }} />
                </div>
            )}
        </div>
    );
};

export default React.memo(CodePlanDisplay);