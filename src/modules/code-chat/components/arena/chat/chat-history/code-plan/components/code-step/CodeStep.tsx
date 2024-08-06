import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { CodePlanDisplayProps, CodeStep as CodeStepType } from '../../CodePlanDisplay.types';
import CodeStepBody from './CodeStepBody';
import CodeStepHeader from './CodeStepHeader';

interface CodeStepProps {
    chatId: number;
    messageId: string;
    plan: CodePlanDisplayProps['plan'];
    step: CodeStepType;
    index: number;
    onDeleteStep: (index: number) => void;
    onCodeFileClick: (filename: string, code: string) => void;
}

export const CodeStep: React.FC<CodeStepProps> = ({
    chatId,
    messageId,
    plan,
    step,
    index,
    onDeleteStep,
    onCodeFileClick
}) => {
    return (
        <Draggable key={index} draggableId={`step-${index + 1}`} index={index}>
            {(provided, snapshot) => (
                <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <div className="code-plan-step" style={{
                        backgroundColor: snapshot.isDragging ? '#fff' : '#d0d0d0',
                    }}>
                        <CodeStepHeader
                            step={step}
                            index={index}
                            onDeleteStep={onDeleteStep}
                            onCodeFileClick={onCodeFileClick}
                        />
                        <CodeStepBody
                            chatId={chatId}
                            messageId={messageId}
                            plan={plan}
                            step={step}
                            index={index}
                        />
                    </div>
                </li>
            )}
        </Draggable>
    );
};

export default CodeStep;
