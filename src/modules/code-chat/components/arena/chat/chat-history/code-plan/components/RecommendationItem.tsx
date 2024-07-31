import { Input } from 'antd';
import '../CodePlanDisplay.scss';

interface RecommendationItemProps {
    recommendation: string;
    isEditing: boolean;
    onEdit: (value: string) => void;
    onSave: (value: string) => void;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ recommendation, isEditing, onEdit, onSave }) => {
    const getContent = () => {
        if (isEditing) {
            return (
                <div className="code-plan-edit-input-container">
                    <Input.TextArea
                        className="ant-input-textarea"
                        value={recommendation}
                        onChange={(e) => onEdit(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === "Enter") {
                                onSave(recommendation);
                            }
                        }}
                        onBlur={() => onSave(recommendation)}
                    />
                </div>
            );
        }
        return <div onClick={() => onEdit(recommendation)}>{recommendation}</div>;
    }

    return <div className="item">{getContent()}</div>;
};

export default RecommendationItem;
