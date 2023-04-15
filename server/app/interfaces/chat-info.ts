import { ChatMessageDB } from './chat-message';

export const PRIVATE_CHAT_IDS_SEPARATOR = ' & ';
export const CHAT_ROOM_BEGINNING = 'chat';
export const GLOBAL_CHAT_NAME = 'Global';

export enum ChatType {
    PUBLIC,
    PRIVATE,
    GLOBAL,
}

export interface ChatInfoDB {
    chatName: string;
    chatType: ChatType;
    usersIds: string[];
    chatHistory: ChatMessageDB[];
    chatCreatorId: string;
}

export interface ChatInfo {
    chatName: string;
    _id: string;
    chatType: ChatType;
    isChatOwner: boolean;
}

export interface ChatCreationResponse {
    errorCode: string;
    chatId: string;
}
