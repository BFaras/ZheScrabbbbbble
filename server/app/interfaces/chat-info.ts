export const PRIVATE_CHAT_IDS_SEPARATOR = ' & ';

export enum ChatType {
    PUBLIC,
    PRIVATE,
    GLOBAL,
}

export interface ChatInfoDB {
    chatName: string;
    chatType: ChatType;
    usersIds: string[];
}

export interface ChatInfo {
    chatName: string;
    _id: string;
    chatType: ChatType;
}

export interface ChatCreationResponse {
    errorCode: string;
    chatId: string;
}