/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ROOM_ID_BEGINNING } from '@app/constants/room-constants';
import { ChatMessageDB } from '@app/interfaces/chat-message';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class ChatGameHistoryService {
    private dbService: DatabaseService;
    private gameChatsHistory: Map<string, ChatMessageDB[]>;

    constructor() {
        this.dbService = Container.get(DatabaseService);
        this.gameChatsHistory = new Map<string, ChatMessageDB[]>();
    }

    async isGameChat(chatId: string): Promise<boolean> {
        return !this.dbService.isChatExistant(chatId) && chatId.includes(ROOM_ID_BEGINNING);
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
