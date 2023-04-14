/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { ServerSocketTestHelper } from '@app/classes/server-socket-test-helper';
import { NO_ERROR } from '@app/constants/error-code-constants';
import { ChatInfo, ChatType } from '@app/interfaces/chat-info';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as io from 'socket.io';
import { Container } from 'typedi';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';
import { UsersStatusService } from './users-status.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports

describe('Chat Tests', async () => {
    const testUserId = 'Jhsdg15f45akdsa';
    const testUserId2 = 'UFnfsahsa54lOP';
    const testUserIdCreatingChats = 'fshhst4552f4FO5B';
    const testChatName = 'TestChat1456Test';
    const testChatType = ChatType.PUBLIC;
    const numberOfChatsToCreateForTest = 3;

    let mongoServer: MongoMemoryServer;
    let chatService: ChatService;
    let dbService: DatabaseService;
    let usersStatusService: UsersStatusService;
    let chatIds: string[] = [];

    before(async () => {
        dbService = Container.get(DatabaseService);
        mongoServer = new MongoMemoryServer();
        await dbService.start(await mongoServer.getUri());
    });

    beforeEach(async () => {
        chatService = Container.get(ChatService);
        usersStatusService = Container.get(UsersStatusService);
        usersStatusService.addOnlineUser(testUserId, new ServerSocketTestHelper('fdsjhshdf464fds65') as unknown as io.Socket);
        usersStatusService.addOnlineUser(testUserId2, new ServerSocketTestHelper('uusahdsfnbnsah89') as unknown as io.Socket);
    });

    afterEach(async () => {
        chatIds.forEach(async (chatId: string) => {
            await dbService.removeChatCanal(chatId);
        });

        chatIds = [];
    });

    after(async () => {
        if (dbService['client']) {
            await dbService['client'].close();
        }
    });

    it('should create chat and user should be in it', async () => {
        const chatCreationResponse = await chatService.createChat(testUserId, testChatName, testChatType);
        chatIds.push(chatCreationResponse.chatId);

        expect(chatCreationResponse.errorCode).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId, chatIds[0])).to.be.true;
    });

    it('should leave chat canal and the user should not be in it anymore', async () => {
        const chatCreationResponse = await chatService.createChat(testUserId, testChatName, testChatType);
        chatIds.push(chatCreationResponse.chatId);
        const chatLeaveError = await chatService.leaveChat(testUserId, chatIds[0]);

        expect(chatCreationResponse.errorCode).to.deep.equals(NO_ERROR);
        expect(chatLeaveError).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId, chatIds[0])).to.be.false;
    });

    it('should be able to join a chat created by another user', async () => {
        const chatCreationResponse = await chatService.createChat(testUserId, testChatName, testChatType);
        chatIds.push(chatCreationResponse.chatId);
        const chatJoinError = await chatService.joinChat(testUserId2, chatIds[0]);

        expect(chatCreationResponse.errorCode).to.deep.equals(NO_ERROR);
        expect(chatJoinError).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId2, chatIds[0])).to.be.true;
    });

    it('should leave chat canal when other user is in it and one user should not be in it anymore while the other is still there and user is not the creator', async () => {
        const chatCreationResponse = await chatService.createChat(testUserId, testChatName, testChatType);
        chatIds.push(chatCreationResponse.chatId);
        const chatJoinError = await chatService.joinChat(testUserId2, chatIds[0]);
        const chatLeaveError = await chatService.leaveChat(testUserId2, chatIds[0]);

        expect(chatCreationResponse.errorCode).to.deep.equals(NO_ERROR);
        expect(chatJoinError).to.deep.equals(NO_ERROR);
        expect(chatLeaveError).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId, chatIds[0])).to.be.true;
        expect(await dbService.isUserInChat(testUserId2, chatIds[0])).to.be.false;
    });

    it('should leave chat canal and if the user leaving is the creator, no one should be in the canal', async () => {
        const chatCreationResponse = await chatService.createChat(testUserId, testChatName, testChatType);
        chatIds.push(chatCreationResponse.chatId);
        const chatJoinError = await chatService.joinChat(testUserId2, chatIds[0]);
        const chatLeaveError = await chatService.leaveChat(testUserId, chatIds[0]);

        expect(chatCreationResponse.errorCode).to.deep.equals(NO_ERROR);
        expect(chatJoinError).to.deep.equals(NO_ERROR);
        expect(chatLeaveError).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId, chatIds[0])).to.be.false;
        expect(await dbService.isUserInChat(testUserId2, chatIds[0])).to.be.false;
    });

    it('should return a list of all the chats a user is in when calling getUserChats', async () => {
        for (let i = 0; i < numberOfChatsToCreateForTest; i++) {
            const chatCreationResponse = await chatService.createChat(testUserIdCreatingChats, testChatName, testChatType);
            chatIds.push(chatCreationResponse.chatId);
        }

        for (let i = 0; i < chatIds.length; i++) {
            if (i % 2 === 0) {
                await chatService.joinChat(testUserId, chatIds[i]);
            } else {
                await chatService.joinChat(testUserId2, chatIds[i]);
            }
        }

        const chatUser1IsIn: ChatInfo[] = await chatService.getUserChats(testUserId);
        const chatUser2IsIn: ChatInfo[] = await chatService.getUserChats(testUserId2);
        const chatIdsUser1IsIn: string[] = [];
        const chatIdsUser2IsIn: string[] = [];

        chatUser1IsIn.forEach((chatInfo: ChatInfo) => {
            chatIdsUser1IsIn.push(chatInfo._id);
        });

        chatUser2IsIn.forEach((chatInfo: ChatInfo) => {
            chatIdsUser2IsIn.push(chatInfo._id);
        });

        for (let i = 0; i < chatIds.length; i++) {
            if (i % 2 === 0) {
                expect(chatIdsUser1IsIn).to.contain(chatIds[i]);
            } else {
                expect(chatIdsUser2IsIn).to.contain(chatIds[i]);
            }
        }
    });

    it('should return a list of all the chats a user can join and is not in when calling getPublicChatsUserCanJoin', async () => {
        for (let i = 0; i < numberOfChatsToCreateForTest; i++) {
            const chatCreationResponse = await chatService.createChat(testUserIdCreatingChats, testChatName, testChatType);
            chatIds.push(chatCreationResponse.chatId);
        }

        for (let i = 0; i < chatIds.length; i++) {
            if (i % 2 === 0) {
                await chatService.joinChat(testUserId, chatIds[i]);
            } else {
                await chatService.joinChat(testUserId2, chatIds[i]);
            }
        }

        const chatUser1CanJoin: ChatInfo[] = await chatService.getPublicChatsUserCanJoin(testUserId);
        const chatUser2CanJoin: ChatInfo[] = await chatService.getPublicChatsUserCanJoin(testUserId2);
        const chatIdsUser1CanJoin: string[] = [];
        const chatIdsUser2CanJoin: string[] = [];

        chatUser1CanJoin.forEach((chatInfo: ChatInfo) => {
            chatIdsUser1CanJoin.push(chatInfo._id);
        });

        chatUser2CanJoin.forEach((chatInfo: ChatInfo) => {
            chatIdsUser2CanJoin.push(chatInfo._id);
        });

        for (let i = 0; i < chatIds.length; i++) {
            if (i % 2 === 0) {
                expect(chatIdsUser2CanJoin).to.contain(chatIds[i]);
            } else {
                expect(chatIdsUser1CanJoin).to.contain(chatIds[i]);
            }
        }
    });
});
