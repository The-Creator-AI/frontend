import { MessageType } from "antd/es/message/interface";
import { getChatsReversed } from "../../../../../store/code-chat.store";
import { ChatMessageType } from "@The-Creator-AI/fe-be-common/dist/types";
import { updateChatHistory } from "../../../../../store/code-chat-store.logic";

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
    console.log({ plan });
    const chat = getChatsReversed().find((chat) => chat.id === chatId);
    if (chat) {
        chat.chat_history = chat.chat_history.map((message : ChatMessageType) => {
            if (message.uuid === messageId) {
                const leadingText = message.message.substring(0, message.message.indexOf('```json'));
                const trailingText = message.message.substring(message.message.lastIndexOf('```') + 4);
                // console.log({
                //     originalMessage: message.message,
                //     newMessage: leadingText + JSON.stringify(plan) + trailingText,
                // });
                message.message = leadingText + '```json\n' + JSON.stringify(plan) + '\n```' + trailingText;
            }
            return message;
        });

        updateChatHistory(chatId, chat.chat_history);
    }
}