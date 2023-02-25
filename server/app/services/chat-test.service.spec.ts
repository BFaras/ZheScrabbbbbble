/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { NO_ERROR } from '@app/constants/error-code-constants';
import { ChatType } from '@app/interfaces/chat-info';
import { Server } from 'app/server';
import { expect } from 'chai';
import { Container } from 'typedi';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');

describe('Chat Tests', async () => {
    const testUserId = 'Jhsdg15f45akdsa';
    const testUserId2 = 'UFnfsahsa54lOP';
    const testChatName = 'TestChat1456Test';
    const testChatType = ChatType.PUBLIC;

    let server: Server;
    let chatService: ChatService;
    let dbService: DatabaseService;
    let chatIds: string[] = [];

    beforeEach(async () => {
        server = Container.get(Server);
        chatService = Container.get(ChatService);
        dbService = Container.get(DatabaseService);
        await server.init(false);
    });

    afterEach(async () => {
        chatIds.forEach(async (chatId: string) => {
            await dbService.removeChatCanal(chatId);
        });
        chatIds = [];
        server['socketManager']['sio'].close();
        Sinon.restore();
    });

    it('should create chat and user should be in it', async () => {
        const chatCreationError = await chatService.createChat(testUserId, testChatName, testChatType);
        chatIds.push((await chatService.getUserChats(testUserId))[0]._id);

        expect(chatCreationError).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId, chatIds[0])).to.be.true;
    });

    it('should leave chat canal and the user should not be in it anymore', async () => {
        const chatCreationError = await chatService.createChat(testUserId, testChatName, testChatType);
        chatIds.push((await chatService.getUserChats(testUserId))[0]._id);
        const chatLeaveError = await chatService.leaveChat(testUserId, chatIds[0]);

        expect(chatCreationError).to.deep.equals(NO_ERROR);
        expect(chatLeaveError).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId, chatIds[0])).to.be.false;
    });

    it('should be able to join a chat created by another user', async () => {
        const chatCreationError = await chatService.createChat(testUserId, testChatName, testChatType);
        chatIds.push((await chatService.getUserChats(testUserId))[0]._id);
        const chatJoinError = await chatService.joinChat(testUserId2, chatIds[0]);

        expect(chatCreationError).to.deep.equals(NO_ERROR);
        expect(chatJoinError).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId2, chatIds[0])).to.be.true;
    });

    it('should leave chat canal when other user is in it and one user should not be in it anymore while the other is still there', async () => {
        const chatCreationError = await chatService.createChat(testUserId, testChatName, testChatType);
        chatIds.push((await chatService.getUserChats(testUserId))[0]._id);
        const chatJoinError = await chatService.joinChat(testUserId2, chatIds[0]);
        const chatLeaveError = await chatService.leaveChat(testUserId, chatIds[0]);

        expect(chatCreationError).to.deep.equals(NO_ERROR);
        expect(chatJoinError).to.deep.equals(NO_ERROR);
        expect(chatLeaveError).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId, chatIds[0])).to.be.false;
        expect(await dbService.isUserInChat(testUserId2, chatIds[0])).to.be.true;
    });
});
