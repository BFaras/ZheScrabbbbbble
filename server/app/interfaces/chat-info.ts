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
