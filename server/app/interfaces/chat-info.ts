export enum ChatType {
    Public,
    Private,
}

export interface ChatInfoDB {
    chatName: string;
    chatType: ChatType;
    usersIds: string[];
}

export interface ChatInfo {
    chatName: string;
    chatId: string;
    chatType: ChatType;
}
