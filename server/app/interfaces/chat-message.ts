export interface ChatMessageDB {
    message: string;
    userId: string;
    timestamp: string;
}

export interface ChatMessage {
    message: string;
    username: string;
    avatar: string;
    timestamp: string;
}

export interface ChatUserInfo {
    username: string;
    avatar: string;
}
