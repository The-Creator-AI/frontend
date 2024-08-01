import React, { useMemo, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteOutlined, FileTextFilled, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { Draggable } from 'react-beautiful-dnd';
import RecommendationItem from './RecommendationItem';
import { CodePlanDisplayProps, CodeStep as CodeStepType } from '../CodePlanDisplay.types';
import { fileCode, handleAddRecommendation, handleCodeButtonClick, handleDeleteRecommendation, handleMoreRecommendations, handleSaveRecommendation, isFileCodeLoading } from '../CodePlanDisplay.utils';
import useStore from '../../../../../../../../state/useStore';
import { codeChatStore$ } from '../../../../../../store/code-chat.store';

interface CodeStepProps {
    chatId: number;
    messageId: string;
    plan: CodePlanDisplayProps['plan'];
    step: CodeStepType;
    index: number;
    onDeleteStep: (index: number) => void;
}

export const CodeStep: React.FC<CodeStepProps> = ({
    chatId,
    messageId,
    plan,
    step,
    index,
    onDeleteStep
}) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const { agents, selectedFiles } = useStore(codeChatStore$);
    const codePlanAgent = useMemo(() => agents?.find((agent) => agent.name === "Code Plan"), [agents]);
    const developerAgent = useMemo(() => agents?.find((agent) => agent.name === "Developer"), [agents]);

    return (
        <Draggable key={index} draggableId={`step-${index + 1}`} index={index}>
            {(provided, snapshot) => (
                <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <div className="recommendation" style={{
                        backgroundColor: snapshot.isDragging ? '#fff' : '#d0d0d0',
                    }}>
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
                                        onClick={() => codePlanAgent && handleMoreRecommendations({
                                            filename: step.filename,
                                            codePlanAgent,
                                            selectedFiles,
                                        })}
                                        className="more-recommendations-button"
                                    />
                                </Tooltip>
                                <Tooltip title={isFileCodeLoading(step.filename) ? "Loading..." : fileCode(step.filename) ? "View Code" : "Get Code"}>
                                    <Button
                                        type="link"
                                        icon={fileCode(step.filename) ? <FileTextFilled /> : <FileTextOutlined />}
                                        loading={isFileCodeLoading(step.filename)}
                                        onClick={() => developerAgent && handleCodeButtonClick({
                                            filename: step.filename,
                                            developerAgent,
                                            selectedFiles,
                                        })}
                                        className="get-code-button"
                                    />
                                </Tooltip>
                                <Tooltip title="Delete Step">
                                    <Button
                                        type="link"
                                        icon={<DeleteOutlined />}
                                        onClick={() => onDeleteStep(index)}
                                        className="delete-step-button"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                        <div className="recommendation-items">
                            {step.recommendations.map((recommendation, recIndex) => (
                                <RecommendationItem
                                    key={recIndex}
                                    recommendation={recommendation}
                                    isEditing={editingIndex === recIndex}
                                    onEdit={() => setEditingIndex(recIndex)}
                                    onSave={(value) => handleSaveRecommendation({
                                        chatId,
                                        messageId,
                                        indices: [index, recIndex],
                                        plan,
                                        newRecommendation: value,
                                    })}
                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleDeleteRecommendation({
                                            chatId,
                                            messageId,
                                            indices: [index, recIndex],
                                            plan,
                                        });
                                    }}
                                    onCancel={() => handleSaveRecommendation({
                                        chatId,
                                        messageId,
                                        indices: [index, recIndex],
                                        plan,
                                        newRecommendation: recommendation,
                                    })}
                                />
                            ))}
                            <div className='add-button'
                                onClick={() => handleAddRecommendation({
                                    chatId,
                                    messageId,
                                    stepIndex: index,
                                    plan
                                })}>
                                <PlusOutlined />
                                Add
                            </div>
                        </div>
                    </div>
                </li>
            )}
        </Draggable>
    );
};