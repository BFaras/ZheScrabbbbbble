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
    const testChatName = 'TestChat1456Test';
    const testChatType = ChatType.PUBLIC;

    let server: Server;
    let chatService: ChatService;
    let dbService: DatabaseService;
    let chatId = '';

    beforeEach(async () => {
        server = Container.get(Server);
        chatService = Container.get(ChatService);
        dbService = Container.get(DatabaseService);
        await server.init(false);
    });

    afterEach(async () => {
        await dbService.removeChatCanal(chatId);
        server['socketManager']['sio'].close();
        Sinon.restore();
    });

    it('should create chat and user should be in it', async () => {
        const chatCreationError = await chatService.createChat(testUserId, testChatName, testChatType);
        chatId = (await chatService.getUserChats(testUserId))[0]._id;
        console.log(chatId);
        expect(chatCreationError).to.deep.equals(NO_ERROR);
        expect(await dbService.isUserInChat(testUserId, chatId)).to.be.true;
    });
});
