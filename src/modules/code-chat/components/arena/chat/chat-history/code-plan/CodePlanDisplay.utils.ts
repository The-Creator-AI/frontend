import { AgentType, ChatMessageType } from "@The-Creator-AI/fe-be-common/dist/types";
import { message } from 'antd';
import { closeModal, openModal, saveCodeToFileFromDeveloperResponse, sendChatMessage, updateChatHistory } from "../../../../../store/code-chat.logic";
import { getChatIdForNewChat, getChatsReversed, getCurrentPath, getFirstChat } from "../../../../../store/code-chat.store";
import { CodePlanDisplayProps, CodeStep } from "./CodePlanDisplay.types";


export const chatTitleForCode = (filename: string) => {
    return `Code for ${filename}`;
};

export const chatTitleForRecommendations = (filename: string) => {
    return `Recommendations for ${filename}`;
};

export const promptForCodeFile = (filename: string) => {
    return `Can you give me the updated code (as per the recommendations) for ${filename}?`;
};

export const promptForRecommendations = (filename: string) => {
    return `Can you give me more detailed and more comprehensive recommendations for ${filename}?`;
};

export const chatForCodeFile = (filename: string) => {
    return getChatsReversed().find((chat) => chat.title === chatTitleForCode(filename));
};

export const chatForRecommendations = (filename: string) => {
    return getChatsReversed().find((chat) => chat.title === chatTitleForRecommendations(filename));
};

export const fileCode = (filename: string) => {
    return chatForCodeFile(filename)?.chat_history?.slice(-1)[0]?.message || "";
};

export const isFileCodeLoading = (filename: string) => {
    return chatForCodeFile(filename)?.isLoading || false;
};

export interface ParsedMessage {
    filePath: string | null;
    code: string | null;
    remainingMessage: string;
}

export const parseDeveloperResponse = (msg: string): ParsedMessage => {
    const result: ParsedMessage = {
        filePath: null,
        code: null,
        remainingMessage: msg
    };

    // Try to parse file_path from JSON
    const filePathMatch = msg.match(/```json\s*(\{[^}]*\})\s*```/);
    if (filePathMatch) {
        try {
            const jsonObj = JSON.parse(filePathMatch[1]);
            if (jsonObj.file_path) {
                result.filePath = jsonObj.file_path;
                result.remainingMessage = msg.replace(filePathMatch[0], '').trim();
            }
        } catch (e) {
            console.error("Failed to parse JSON:", e);
        }
    }

    // Try to extract code block
    const codeMatch = result.remainingMessage.match(/```(?:\w+\n)?(.+?)```/s);
    if (codeMatch?.[1]) {
        result.code = codeMatch[1];
        result.remainingMessage = result.remainingMessage.replace(codeMatch[0], '').trim();
    }

    return result;
};

export const updatePlanInChat = (chatId: number, messageId: string, plan: any) => {
    const chat = getChatsReversed().find((chat) => chat.id === chatId);
    if (chat) {
        chat.chat_history = chat.chat_history.map((message : ChatMessageType) => {
            if (message.uuid === messageId) {
                const leadingText = message.message.substring(0, message.message.indexOf('```json'));
                const trailingText = message.message.substring(message.message.lastIndexOf('```') + 4);
                message.message = leadingText + '```json\n' + JSON.stringify(plan) + '\n```' + trailingText;
            }
            return message;
        });

        updateChatHistory(chatId, chat.chat_history);
    }
}

export const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        message.success('Code copied to clipboard!');
    });
};

export const handleCodeButtonClick = (args: {
    filename: string;
    selectedFiles: string[];
    developerAgent: AgentType | null;
}) => {
    // const { filename, selectedFiles, developerAgent } = args;
    // if (fileCode(filename)) {
    //     openModal('CodeFileModal', {
    //         name: filename,
    //         code: parseDeveloperResponse(fileCode(filename)).code || '',
    //         onApply: () => {
    //             const parsedMessage = parseDeveloperResponse(fileCode(filename));
    //             saveCodeToFileFromDeveloperResponse({
    //                 ...parsedMessage,
    //                 filePath: parsedMessage.filePath || filename
    //             }, getCurrentPath());
    //             closeModal('CodeFileModal');
    //         },
    //         onClose: () => closeModal('CodeFileModal'),
    //     });
    // } else {
        handleGetCode(args);
    // }
};

export const handleGetCode = (args: {
    filename: string;
    selectedFiles: string[];
    developerAgent: AgentType | null;
}) => {
    const { filename, selectedFiles, developerAgent } = args;
    sendChatMessage({
        // chatId: getChatIdForNewChat(),
        chatId: getFirstChat().id || getChatIdForNewChat(),
        chatTitle: chatTitleForCode(filename),
        agentInstruction: developerAgent?.systemInstructions,
        agentName: developerAgent?.name,
        message: promptForCodeFile(filename),
        selectedFiles: selectedFiles.map((filePath) => `${getCurrentPath()}/${filePath}`),
        chatHistory: getFirstChat()?.chat_history
    });
};

export const handleSaveRecommendation = (args: {
    chatId: number;
    messageId: string;
    plan: CodePlanDisplayProps['plan'];
    indices: [number, number];
    newRecommendation: string;
}) => {
    const { chatId, messageId, plan, indices, newRecommendation } = args;
    const newPlan = {
        ...plan,
        code_plan: plan.code_plan.map((step, stepIndex) => 
            stepIndex === indices[0]
                ? {
                    ...step,
                    recommendations: (step as CodeStep).recommendations.map((rec, recIndex) =>
                        recIndex === indices[1] ? newRecommendation : rec
                    )
                }
                : step
        )
    };
    updatePlanInChat(chatId, messageId, newPlan);
};

export const handleDeleteRecommendation = (args: {
    chatId: number;
    messageId: string;
    plan: CodePlanDisplayProps['plan'];
    indices: [number, number];
}) => {
    const { chatId, messageId, plan, indices } = args;
    const newPlan = {
        ...plan,
        code_plan: plan.code_plan.map((step, stepIndex) =>
            stepIndex === indices[0]
                ? {
                    ...step,
                    recommendations: (step as CodeStep).recommendations.filter((_, recIndex) => recIndex !== indices[1])
                }
                : step
        )
    };
    updatePlanInChat(chatId, messageId, newPlan);
};

export const handleAddRecommendation = (args: {
    chatId: number;
    messageId: string;
    plan: CodePlanDisplayProps['plan'];
    stepIndex: number;
}) => {
    const { chatId, messageId, plan, stepIndex } = args;
    const newPlan = {
        ...plan,
        code_plan: plan.code_plan.map((step, index) =>
            index === stepIndex
                ? {
                    ...step,
                    recommendations: [...(step as CodeStep).recommendations, ""]
                }
                : step
        )
    };
    updatePlanInChat(chatId, messageId, newPlan);
};

export const handleMoreRecommendations = (args: {
    filename: string;
    selectedFiles: string[];
    codePlanAgent: AgentType | null;
}) => {
    const { filename, selectedFiles, codePlanAgent } = args;
    sendChatMessage({
        chatId: getChatIdForNewChat(),
        chatTitle: chatTitleForRecommendations(filename),
        agentInstruction: codePlanAgent?.systemInstructions,
        agentName: codePlanAgent?.name,
        message: promptForRecommendations(filename),
        selectedFiles: selectedFiles.map((filePath) => `${getCurrentPath()}/${filePath}`),
        chatHistory: getFirstChat()?.chat_history
    });
};
