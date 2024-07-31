import { Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import '../CodePlanDisplay.scss';

interface RecommendationItemProps {
    recommendation: string;
    isEditing: boolean;
    onEdit: (value: string) => void;
    onSave: (value: string) => void;
    onCancel: () => void;
    onDelete: (e: React.MouseEvent) => void;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ recommendation, isEditing, onEdit, onSave, onCancel, onDelete }) => {
    const getContent = () => {
        if (isEditing) {
            return (
                <div className="code-plan-edit-input-container">
                    <Input.TextArea
                        autoFocus
                        className="ant-input-textarea"
                        value={recommendation}
                        onChange={(e) => onEdit(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === "Enter") {
                                onSave(recommendation);
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
        return <div onClick={() => onEdit(recommendation)}>
            {recommendation}
            <DeleteOutlined
                className="delete-icon"
                onClick={onDelete}
                title="Delete Recommendation"
            />
        </div>;
    }

    return <div className="item">{getContent()}</div>;
};

export default RecommendationItem;

