import { DATABASE_UNAVAILABLE, NO_ERROR } from '@app/constants/error-code-constants';
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
        let errorCode = DATABASE_UNAVAILABLE;

        if (createdChatId !== '') {
            errorCode = NO_ERROR;
            this.joinChat(userId, createdChatId);
        }

        return errorCode;
    }

    async joinChat(userId: string, chatId: string): Promise<string> {
        let errorCode = NO_ERROR;
        if (!(await this.dbService.joinChatCanal(userId, chatId))) {
            errorCode = DATABASE_UNAVAILABLE;
        }
        return errorCode;
    }

    async leaveChat(userId: string, chatId: string): Promise<string> {
        let errorCode = NO_ERROR;

        if (!(await this.dbService.leaveChatCanal(userId, chatId))) {
            errorCode = DATABASE_UNAVAILABLE;
        }
        return errorCode;
    }

    async getPublicChats(): Promise<ChatInfo[]> {}
    async getUserChats(userId: string): Promise<ChatInfo[]> {}
}
