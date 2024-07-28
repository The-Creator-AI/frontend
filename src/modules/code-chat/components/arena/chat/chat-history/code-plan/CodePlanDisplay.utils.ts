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
