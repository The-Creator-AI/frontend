import { Button } from 'antd';
import React, { useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useCodePlanDisplay } from './CodePlanDisplay.model';
import './CodePlanDisplay.scss';
import { CodePlanDisplayProps } from './CodePlanDisplay.types';
import { CodeStep } from './components/code-step/CodeStep';
import { CommandStep } from './components/CommandStep';
import Header from './components/Header';
import { NewStepForm } from './components/NewStepForm';
import CodeFile from './components/CodeFile';

const CodePlanDisplay: React.FC<CodePlanDisplayProps> = ({ plan, chatId, messageId }) => {
  const {
    newStepType,
    handleOnDragEnd,
    setNewStepType,
    handleDeleteStep,
    handleAddNewStep,
  } = useCodePlanDisplay(plan, chatId, messageId);
  const [displayCodeFile, setDisplayCodeFile] = useState<{
    filename: string;
    code: string;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleCloseCodeFile = () => {
    setDisplayCodeFile(null);
  };

  return (
    <div className="code-plan-display" ref={ref}>
      <div className="main">
      <Header
        plan={plan}
        chatId={chatId}
        messageId={messageId}
      />
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="code-plan-steps" type="group">
          {(provided) => (
            <ul
              className="code-plan-steps"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {plan.code_plan.map((step, index) =>
                'filename' in step ? (
                  <CodeStep
                    key={index}
                    chatId={chatId}
                    messageId={messageId}
                    step={step}
                    index={index}
                    onDeleteStep={handleDeleteStep}
                    plan={plan}
                    onCodeFileClick={(filename, code) => {
                      setDisplayCodeFile({
                        filename,
                        code,
                      });
                    }}
                  />
                ) : (
                  <CommandStep
                    key={index}
                    step={step}
                    index={index}
                    onDeleteStep={handleDeleteStep}
                  />
                )
              )}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <div className="add-step-buttons">
        <Button onClick={() => setNewStepType('code')}>Add Code Step</Button>
        <Button onClick={() => setNewStepType('command')}>Add Command Step</Button>
      </div>
      {newStepType && (
        <NewStepForm
          type={newStepType}
          onAddStep={handleAddNewStep}
          onCancel={() => setNewStepType(null)}
        />
      )}
      </div>
      {displayCodeFile && (
        <div className='preview'>
          <CodeFile
            name={displayCodeFile.filename || ''}
            code={displayCodeFile.code || ''}
            onClose={handleCloseCodeFile}
            height={(ref.current?.clientHeight || 800) - 150}
        />
        </div>
      )}
    </div>
  );
};

export default React.memo(CodePlanDisplay);
