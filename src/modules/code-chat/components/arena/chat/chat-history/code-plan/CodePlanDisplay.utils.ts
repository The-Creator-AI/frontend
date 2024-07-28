import { getChatsReversed } from "../../../../../store/code-chat.store";

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
