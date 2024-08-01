import { Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import '../CodePlanDisplay.scss';
import { useEffect, useState } from 'react';

interface RecommendationItemProps {
    recommendation: string;
    isEditing: boolean;
    onEdit: () => void;
    onSave: (value: string) => void;
    onCancel: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ recommendation, isEditing, onEdit, onSave, onCancel, onDelete }) => {
    const [inputValue, setInputValue] = useState(recommendation);

    useEffect(() => {
        setInputValue(recommendation);
    }, [recommendation]);

    const getContent = () => {
        if (isEditing) {
            return (
                <div className="code-plan-edit-input-container">
                    <Input.TextArea
                        autoFocus
                        className="ant-input-textarea"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === "Enter") {
                                onSave(inputValue);
                            }
                            if (e.key === "Escape") {
                                onCancel();
                            }
                        }}
                        onBlur={() => onSave(recommendation)}
                    />
                </div>
            );
        }
        return <div>
            {recommendation}
            <DeleteOutlined
                className="delete-icon"
                onClick={onDelete}
                title="Delete Recommendation"
            />
        </div>;
    }

    return <div className="item" onClick={() => onEdit()}>{getContent()}</div>;
};

export default RecommendationItem;

