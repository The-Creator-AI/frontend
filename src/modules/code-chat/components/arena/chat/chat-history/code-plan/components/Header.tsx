import { Input, Typography } from 'antd';
import { useState } from 'react';
import '../CodePlanDisplay.scss';
import { updatePlanInChat } from '../CodePlanDisplay.utils';
import { CodePlanDisplayProps } from '../CodePlanDisplay.types';

interface HeaderProps {
    plan: CodePlanDisplayProps['plan'];
  chatId: number;
  messageId: string;
}

export const Header: React.FC<HeaderProps> = ({ plan, chatId, messageId }) => {
const { title, description } = plan;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newDescription, setNewDescription] = useState(description);

  const handleSaveTitle = () => {
    updatePlanInChat(chatId, messageId, {
      ...plan,
      title: newTitle
    });
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    updatePlanInChat(chatId, messageId, {
      ...plan,
      description: newDescription
    });
    setIsEditingDescription(false);
  };

  return (
    <div className="header">
      {isEditingTitle ? (
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={(e) => {
            e.key === 'Enter' && handleSaveTitle();
            e.key === 'Escape' && setIsEditingTitle(false);
          }}
        />
      ) : (
        <h2
          className="code-plan-title"
          onClick={() => setIsEditingTitle(true)}
        >
          {title}
        </h2>
      )}
      {isEditingDescription ? (
        <Input.TextArea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          onBlur={handleSaveDescription}
          onKeyDown={(e) => {
            e.key === 'Enter' && e.shiftKey && handleSaveDescription();
            e.key === 'Escape' && setIsEditingDescription(false);
          }}
        />
      ) : (
        <p
          className="code-plan-summary"
          onClick={() => setIsEditingDescription(true)}
        >
          <Typography.Text ellipsis>
            {description}
          </Typography.Text>
        </p>
      )}
    </div>
  );
};

export default Header;
