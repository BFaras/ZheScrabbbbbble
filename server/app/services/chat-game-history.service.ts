/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ROOM_ID_BEGINNING } from '@app/constants/room-constants';
import { ChatMessageDB } from '@app/interfaces/chat-message';
import { Service } from 'typedi';

@Service()
export class ChatGameHistoryService {
    private gameChatsHistory: Map<string, ChatMessageDB[]>;

    constructor() {
        this.gameChatsHistory = new Map<string, ChatMessageDB[]>();
    }

    isGameChat(chatId: string): boolean {
        if (chatId) {
            return chatId.includes(ROOM_ID_BEGINNING);
        }
        return false;
    }

    addMessageToGameChatHistory(gameId: string, messageDB: ChatMessageDB) {
        this.createGameChatHistory(gameId);
        this.gameChatsHistory.get(gameId)?.push(messageDB);
    }

    getGameChatHistory(gameId: string): ChatMessageDB[] {
        this.createGameChatHistory(gameId);
        return this.gameChatsHistory.get(gameId)!;
    }

    removeGameChatHistory(gameId: string) {
        this.gameChatsHistory.delete(gameId);
    }

    private createGameChatHistory(gameId: string) {
        if (!this.gameChatsHistory.has(gameId)) {
            this.gameChatsHistory.set(gameId, []);
        }
    }
}
