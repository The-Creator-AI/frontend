import React from 'react';
import { Button, Tooltip } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Draggable } from 'react-beautiful-dnd';
import { CommandStep as CommandStepType } from '../CodePlanDisplay.types';
import { handleCopy } from '../CodePlanDisplay.utils';

interface CommandStepProps {
    step: CommandStepType;
    index: number;
    onDeleteStep: (index: number) => void;
}

export const CommandStep: React.FC<CommandStepProps> = ({ step, index, onDeleteStep }) => {
    return (
        <Draggable key={index} draggableId={`step-${index + 1}`} index={index}>
            {(provided) => (
                <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                >
                    <div className="command">
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
                                onClick={() => onDeleteStep(index)}
                                className="delete-step-button"
                            />
                        </Tooltip>
                    </div>
                </li>
            )}
        </Draggable>
    );
};