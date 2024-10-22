import { DeleteOutlined, FileTextFilled, FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React, { useMemo } from 'react';
import useStore from '../../../../../../../../../state/useStore';
import { codeChatStoreStateSubject } from '../../../../../../../store/code-chat.store';
import { CodeStep as CodeStepType } from '../../CodePlanDisplay.types';
import { fileCode, handleCodeButtonClick, handleMoreRecommendations, isFileCodeLoading } from '../../CodePlanDisplay.utils';

interface CodeStepHeaderProps {
    step: CodeStepType;
    index: number;
    onDeleteStep: (index: number) => void;
    onCodeFileClick?: (filename: string, code: string) => void;
}

export const CodeStepHeader: React.FC<CodeStepHeaderProps> = ({
    step,
    index,
    onDeleteStep,
    onCodeFileClick, // Use the prop
}) => {
    const { agents, selectedFiles } = useStore(codeChatStoreStateSubject);
    const codePlanAgent = useMemo(() => agents?.find((agent) => agent.name === "Code Plan"), [agents]);
    const developerAgent = useMemo(() => agents?.find((agent) => agent.name === "Developer"), [agents]);

    return (
        <div className="code-plan-step-description">
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
                {/* <Tooltip title={isFileCodeLoading(step.filename) ? "Loading..." : fileCode(step.filename) ? "View Code" : "Get Code"}> */}
                <Tooltip title={"Get Code"}>
                    <Button
                        type="link"
                        icon={<FileTextOutlined />}
                        // icon={fileCode(step.filename) ? <FileTextFilled /> : <FileTextOutlined />}
                        loading={isFileCodeLoading(step.filename)}
                        onClick={() => {
                            // !fileCode(step.filename) && 
                            developerAgent && handleCodeButtonClick({
                                filename: step.filename,
                                developerAgent,
                                selectedFiles,
                            });
                            onCodeFileClick && onCodeFileClick(step.filename, fileCode(step.filename));
                        }}
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
    );
};

export default CodeStepHeader;
