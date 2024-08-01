import { PlusOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { CodePlanDisplayProps, CodeStep as CodeStepType } from '../../CodePlanDisplay.types';
import { handleAddRecommendation, handleDeleteRecommendation, handleSaveRecommendation } from '../../CodePlanDisplay.utils';
import RecommendationItem from '../RecommendationItem';

interface CodeStepBodyProps {
    chatId: number;
    messageId: string;
    plan: CodePlanDisplayProps['plan'];
    step: CodeStepType;
    index: number;
}

const CodeStepBody: React.FC<CodeStepBodyProps> = ({
    chatId,
    messageId,
    plan,
    step,
    index,
}) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    return (
        <div className="code-plan-step-items">
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
    );
};

export default CodeStepBody;
