import { Button, message, Tooltip } from "antd";
import React, { useState, useEffect } from "react";
import { CopyOutlined, PlusOutlined, EditOutlined, FileTextOutlined, FileTextFilled } from '@ant-design/icons';
import "./CodePlanDisplay.scss"; // Add this line to import the stylesheet
import useChat from "../../useChat";
import useStore from "../../../../../../../state/useStore";
import { codeChatStore$, getChatIdForNewChat } from "../../../../../store/code-chat.store";
import { saveCodeToFileFromDeveloperResponse, savePlan } from "../../../../../store/code-chat-store.logic";
import { chatTitleForCode, chatTitleForRecommendations, fileCode, isFileCodeLoading, parseDeveloperResponse, promptForCodeFile, promptForRecommendations } from "./CodePlanDisplay.utils";
import CodeFileModal from "./components/CodeFile.modal";

interface CodePlanDisplayProps {
    plan: {
        title: string;
        description: string;
        code_plan: ({
            filename: string;
            recommendations: string[];
        } | {
            command: string;
            description: string;
        })[];
    };
}

const CodePlanDisplay: React.FC<CodePlanDisplayProps> = ({ plan }) => {
    const { agents, selectedFiles, currentPath } = useStore(codeChatStore$);
    const codePlanAgent = agents?.find((agent) => agent.name === "Code Plan");
    const developerAgent = agents?.find((agent) => agent.name === "Developer");
    const { sendMessage } = useChat();
    const [editingRecommendationIndices, setEditingRecommendationIndices] = useState<[number, number] | null>(null); // Track the index of the recommendation being edited
    const [recommendations, setRecommendations] = useState<string[][]>(plan.code_plan.map((step: any) => step.recommendations || [])); // Store recommendations as a 2D array
    const [codeFileModal, setCodeFileModal] = useState({
        filename: '',
        isOpen: false
    });

    useEffect(() => {
        // savePlan({
        //     title: plan.title,
        //     description: plan.description,
        //     code_plan: JSON.stringify(plan.code_plan, null, 2)
        // });
    }, [plan]);

    // Handler for "More Recommendations" button
    const handleMoreRecommendations = async (filename: string, index: number) => {
        console.log(`Requesting more recommendations for: ${filename}`);
        sendMessage({
            chatId: getChatIdForNewChat(),
            chatTitle: chatTitleForRecommendations(filename),
            agentInstruction: codePlanAgent?.systemInstructions,
            agentName: codePlanAgent?.name,
            message: promptForRecommendations(filename),
            selectedFiles: selectedFiles.map((filePath) => `${currentPath}/${filePath}`),
        });
    };
    // Handler for "Get Code" button
    const handleGetCode = async (filename: string, index: number) => {
        console.log(`Requesting code for: ${filename}`);
        sendMessage({
            chatId: getChatIdForNewChat(),
            chatTitle: chatTitleForCode(filename),
            agentInstruction: developerAgent?.systemInstructions,
            agentName: developerAgent?.name,
            message: promptForCodeFile(filename),
            selectedFiles: selectedFiles.map((filePath) => `${currentPath}/${filePath}`),
        });
    }
    // Handler for editing a recommendation
    const handleEditRecommendation = (indices: [number, number], filename: string, recommendation: string) => {
        setEditingRecommendationIndices(indices);
        const updatedRecommendations = [...recommendations];
        updatedRecommendations[indices[0]][indices[1]] = recommendation;
        setRecommendations(updatedRecommendations);
    };
    // Handle recommendation changes after it's saved
    useEffect(() => {
        console.log("recommendations changed:", recommendations);
    }, [recommendations]);

    // Handler for saving a recommendation after editing
    const handleSaveRecommendation = (index: number, filename: string, newRecommendation: string) => {
        setEditingRecommendationIndices(null); // Reset the editing index
        const updatedRecommendations = [...recommendations];
        updatedRecommendations[index] = [newRecommendation]; // Update the recommendation in the state
        setRecommendations(updatedRecommendations);
        // Now, you might want to send this updated plan to your backend or update the plan object
        // For example, you could send a request to update the plan in your database:
        // sendMessage({
        //     agentInstruction: codePlanAgent?.systemInstructions,
        //     agentName: codePlanAgent?.name,
        //     message: `Update the code plan for ${filename} with the following recommendations: ${JSON.stringify(updatedRecommendations)}`,
        //     selectedFiles: selectedFiles.map((filePath) => `${currentPath}/${filePath}`),
        // });
        // ... (Send request to update plan)
    };
    // Handler for cancelling editing a recommendation
    const handleCancelEdit = () => {
        setEditingRecommendationIndices(null); // Reset the editing index
        setRecommendations(plan.code_plan.map((step: any) => step.recommendations || [])); // Reset the recommendations to the original plan
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success('Code copied to clipboard!');
        });
    };

    return (
        <div className="code-plan-display">
            <h2 className="code-plan-title">{plan.title}</h2>
            <p className="code-plan-summary">{plan.description}</p>
            <ul className="recommendations">
                {plan.code_plan.map((step: any, stepIndex) => (
                    step.command ? <li key={stepIndex} className="command">
                        <span className="command-code">{step.command}</span>
                        <Tooltip title="Copy Command">
                            <Button
                                type="link"
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(step.command)}
                                className="get-code-button"
                            />
                        </Tooltip>
                    </li>
                        : <li key={stepIndex} className="recommendation">
                            <span className="recommendation-description">
                                <span className="filename">
                                    {step.filename}
                                </span>
                                {/* More Recommendations Button */}
                                <Tooltip title="More detailed">
                                    <Button
                                        type="link"
                                        icon={<PlusOutlined />}
                                        onClick={() => handleMoreRecommendations(step.filename, stepIndex as number)}
                                        className="more-recommendations-button"
                                    />
                                </Tooltip>
                                <Tooltip title={isFileCodeLoading(step.filename) ? "Loading..." : fileCode(step.filename) ? "View Code" : "Get Code"}>
                                    <Button
                                        type="link"
                                        icon={fileCode(step.filename) ? <FileTextFilled /> : <FileTextOutlined />}
                                        loading={isFileCodeLoading(step.filename)}
                                        onClick={() => fileCode(step.filename) ? setCodeFileModal({
                                            filename: step.filename,
                                            isOpen: true
                                        }) : handleGetCode(step.filename, stepIndex as number)}
                                        className="get-code-button"
                                    />
                                </Tooltip>
                            </span>
                            {recommendations[stepIndex].map((recommendation, recIndex) => (
                                <div key={recIndex} className="code-plan-recommendation-item">
                                    {editingRecommendationIndices?.[0] === stepIndex && editingRecommendationIndices[1] === recIndex ? (
                                        <div className="code-plan-edit-input-container">
                                            <input
                                                type="text"
                                                className="code-plan-edit-input"
                                                value={recommendation}
                                                onChange={(e) => handleEditRecommendation([stepIndex, recIndex], step.filename, e.target.value)}
                                                onKeyDown={(e: any) => {
                                                    if (e.key === "Enter") {
                                                        handleSaveRecommendation(recIndex as number, step.filename, e.target.value);
                                                    }
                                                }}
                                                onBlur={() => handleSaveRecommendation(recIndex as number, step.filename, recommendation)}
                                            />
                                            <Button type="link" onClick={handleCancelEdit} icon={<EditOutlined />} className="code-plan-edit-icon" />
                                        </div>
                                    ) : (
                                        <span
                                            onClick={() => handleEditRecommendation([stepIndex, recIndex], step.filename, recommendation)}
                                        >
                                            {recommendation}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </li>
                ))}
            </ul>
            {codeFileModal ? <CodeFileModal isOpen={codeFileModal.isOpen}
                key={codeFileModal.filename}
                name={codeFileModal.filename}
                code={parseDeveloperResponse(fileCode(codeFileModal.filename)).code || ''}
                onApply={() => {
                    const parsedMessage = parseDeveloperResponse(fileCode(codeFileModal.filename));
                    saveCodeToFileFromDeveloperResponse(parsedMessage);
                    setCodeFileModal({
                        filename: '',
                        isOpen: false
                    });
                }}
                onClose={() => setCodeFileModal({
                    filename: '',
                    isOpen: false
                })}
            /> : null}
        </div>
    );
};

export default React.memo(CodePlanDisplay);