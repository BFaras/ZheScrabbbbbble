export enum ChatType {
    Public,
    Private,
}

export interface ChatInfo {
    chatName: string;
    chatCode: string;
    chatType: ChatType;
}
