import { ChatInfo } from '@app/interfaces/chat-info';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class ChatService {
    dbService: DatabaseService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
    }

    async createChat(username: string, chatName: string): Promise<string> {}
    async joinChat(username: string, chatCode: string): Promise<string> {}
    async leaveChat(username: string, chatCode: string): Promise<string> {}
    async getPublicChats(): Promise<ChatInfo[]> {}
    async getUserChats(username: string): Promise<ChatInfo[]> {}
}
