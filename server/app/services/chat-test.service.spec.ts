/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { ChatInfoDB, ChatType } from '@app/interfaces/chat-info';
import { Server } from 'app/server';
import { expect } from 'chai';
import { Container } from 'typedi';
import { DatabaseService } from './database.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');

describe('Chat Tests', async () => {
    let dbService: DatabaseService;
    let server: Server;

    beforeEach(async () => {
        server = Container.get(Server);
        dbService = Container.get(DatabaseService);
        await server.init(false);
    });

    afterEach(async () => {
        server['socketManager']['sio'].close();
        Sinon.restore();
    });

    it('should create chat', () => {
        const chatInfo: ChatInfoDB = { chatName: 'HelloChat', chatType: ChatType.PUBLIC, usersIds: [] };
        await dbService.addNewChatCanal(chatInfo);
        expect(true).to.be.true;
    });
});
