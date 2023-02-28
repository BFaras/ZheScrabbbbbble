import { DATABASE_UNAVAILABLE, NO_ERROR } from '@app/constants/error-code-constants';
import { ChatCreationResponse, ChatInfo, ChatInfoDB, ChatType } from '@app/interfaces/chat-info';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class ChatService {
    dbService: DatabaseService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
    }

    async createChat(userId: string, chatName: string, chatType: ChatType): Promise<ChatCreationResponse> {
        const chatInfo: ChatInfoDB = { chatName, chatType, usersIds: [] };
        const createdChatId: string = await this.dbService.addNewChatCanal(chatInfo);
        let errorCode = DATABASE_UNAVAILABLE;

        if (createdChatId !== '') {
            errorCode = await this.joinChat(userId, createdChatId);
        }

        return { errorCode, chatId: createdChatId };
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

    async getPublicChatsUserCanJoin(userId: string): Promise<ChatInfo[]> {
        return await this.dbService.getChatCanalsUserCanJoin(userId);
    }
    async getUserChats(userId: string): Promise<ChatInfo[]> {
        return await this.dbService.getChatsUserIsIn(userId);
    }

    async joinGlobalChat(userId: string) {
        if (!(await this.createGlobalChat(userId))) {
            await this.joinChat(userId, await this.dbService.getGlobalChatId());
        }
    }

    private async createGlobalChat(userId: string): Promise<boolean> {
        if (!(await this.dbService.isGlobalChatExistant())) {
            await this.createChat(userId, 'Global Chat', ChatType.GLOBAL);
            return true;
        }
        return false;
    }
}
