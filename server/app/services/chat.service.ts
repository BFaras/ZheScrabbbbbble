import { ChatInfo, ChatInfoDB, ChatType } from '@app/interfaces/chat-info';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class ChatService {
    dbService: DatabaseService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
    }

    async createChat(userId: string, chatName: string, chatType: ChatType): Promise<string> {
        const chatInfo: ChatInfoDB = { chatName, chatType, usersIds: [] };
        const createdChatId: string = await this.dbService.addNewChatCanal(chatInfo);
        return createdChatId;
    }
    async joinChat(username: string, chatId: string): Promise<string> {}
    async leaveChat(username: string, chatId: string): Promise<string> {}
    async getPublicChats(): Promise<ChatInfo[]> {}
    async getUserChats(username: string): Promise<ChatInfo[]> {}
}
