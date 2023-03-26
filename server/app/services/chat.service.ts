/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DATABASE_UNAVAILABLE, NO_ERROR } from '@app/constants/error-code-constants';
import { ChatCreationResponse, ChatInfo, ChatInfoDB, ChatType, PRIVATE_CHAT_IDS_SEPARATOR } from '@app/interfaces/chat-info';
import { ChatMessage, ChatMessageDB, ChatUserInfo } from '@app/interfaces/chat-message';
import { Container, Service } from 'typedi';
import { ChatGameHistoryService } from './chat-game-history.service';
import { DatabaseService } from './database.service';

@Service()
export class ChatService {
    private dbService: DatabaseService;
    private chatGameHistoryService: ChatGameHistoryService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
        this.chatGameHistoryService = Container.get(ChatGameHistoryService);
    }

    async createChat(userId: string, chatName: string, chatType: ChatType): Promise<ChatCreationResponse> {
        const chatInfo: ChatInfoDB = { chatName, chatType, usersIds: [], chatHistory: [] };
        const createdChatId: string = await this.dbService.addNewChatCanal(chatInfo);
        let errorCode = DATABASE_UNAVAILABLE;

        if (createdChatId !== '') {
            errorCode = await this.joinChat(userId, createdChatId);
        }

        return { errorCode, chatId: createdChatId };
    }

    async createFriendsChat(userId: string, friendUserId: string): Promise<string> {
        const chatName = userId + PRIVATE_CHAT_IDS_SEPARATOR + friendUserId;
        let errorCode = DATABASE_UNAVAILABLE;

        if (friendUserId !== '') {
            const chatCreationResponse: ChatCreationResponse = await this.createChat(userId, chatName, ChatType.PRIVATE);
            if (chatCreationResponse.errorCode === NO_ERROR) {
                errorCode = await this.joinChat(friendUserId, chatCreationResponse.chatId);
            }
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

    async getPublicChatsUserCanJoin(userId: string): Promise<ChatInfo[]> {
        return await this.dbService.getChatCanalsUserCanJoin(userId);
    }
    async getUserChats(userId: string): Promise<ChatInfo[]> {
        const userChats: ChatInfo[] = await this.dbService.getChatsUserIsIn(userId);

        for (const chatInfo of userChats) {
            if (chatInfo.chatType === ChatType.PRIVATE) {
                chatInfo.chatName = await this.renamePrivateChat(chatInfo.chatName, userId);
            }
        }

        return userChats;
    }

    async getChatHistory(chatId: string): Promise<ChatMessage[]> {
        if (await this.chatGameHistoryService.isGameChat(chatId)) {
            return await this.transformChatHistoryForClient(this.chatGameHistoryService.getGameChatHistory(chatId));
        } else {
            return await this.transformChatHistoryForClient(await this.dbService.getChatHistory(chatId));
        }
    }

    async addChatMessageToHistory(userId: string, chatId: string, chatMessage: ChatMessage): Promise<void> {
        const chatMessageDB: ChatMessageDB = this.createChatMessageDB(userId, chatMessage);

        if (await this.chatGameHistoryService.isGameChat(chatId)) {
            this.chatGameHistoryService.addMessageToGameChatHistory(chatId, chatMessageDB);
        } else {
            await this.dbService.addMessageToHistory(chatId, chatMessageDB);
        }
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

    private async renamePrivateChat(currentChatName: string, userId: string): Promise<string> {
        const idsInChatName: string[] = currentChatName.split(PRIVATE_CHAT_IDS_SEPARATOR);
        const friendUserId = idsInChatName[0] !== userId ? idsInChatName[0] : idsInChatName[1];
        return this.dbService.getUsernameFromId(friendUserId);
    }

    private createChatMessageDB(userId: string, chatMessage: ChatMessage): ChatMessageDB {
        return {
            userId,
            message: chatMessage.message,
            timestamp: chatMessage.timestamp,
        };
    }

    private async transformChatHistoryForClient(chatHistory: ChatMessageDB[]): Promise<ChatMessage[]> {
        const chatUserInfos: Map<string, ChatUserInfo> = new Map<string, ChatUserInfo>();
        const clientChatHistory: ChatMessage[] = [];

        for (const chatMessage of chatHistory) {
            const userId = chatMessage.userId;
            if (!chatUserInfos.has(userId)) {
                chatUserInfos.set(userId, {
                    username: await this.dbService.getUsernameFromId(userId),
                    avatar: await this.dbService.getUserAvatar(userId),
                });
            }
            const chatUserInfo = chatUserInfos.get(chatMessage.userId);

            clientChatHistory.push({
                message: chatMessage.message,
                timestamp: chatMessage.timestamp,
                username: chatUserInfo!.username,
                avatar: chatUserInfo!.avatar,
            });
        }
        return clientChatHistory;
    }
}
