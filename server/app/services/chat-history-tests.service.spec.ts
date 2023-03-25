/* eslint-disable dot-notation */
/* eslint-disable max-len */
import { NO_ERROR } from '@app/constants/error-code-constants';
import { ChatType } from '@app/interfaces/chat-info';
import { ChatMessage, ChatMessageDB } from '@app/interfaces/chat-message';
import { Question } from '@app/interfaces/question';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Container } from 'typedi';
import { AuthentificationService } from './authentification.service';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';

describe('Chat History Tests', async () => {
    const testUsername1 = 'testUser157Test';
    const testUsername2 = 'Test2User';
    const testPassword = 'tE!s&to~';
    const testEmail = 'myTestMail12564@poly.com';
    const testAvatar1 = 'av111';
    const testAvatar2 = 'av222';
    const testSecurityQuestion: Question = { question: 'Who are you?', answer: 'Me' };
    const testChatName = 'TestChat1456Test';
    const testChatType = ChatType.PUBLIC;
    const numberOfChatsToCreateForTest = 3;

    let mongoServer: MongoMemoryServer;
    let dbService: DatabaseService;
    let authService: AuthentificationService;
    let chatService: ChatService;
    let accountCreated = false;
    let account2Created = false;
    let user1Id = '';
    let user2Id = '';
    let chatIds: string[] = [];

    before(async () => {
        dbService = Container.get(DatabaseService);
        mongoServer = new MongoMemoryServer();
        await dbService.start(await mongoServer.getUri());
    });

    beforeEach(async () => {
        authService = Container.get(AuthentificationService);
        chatService = Container.get(ChatService);

        const accountCreationError = await authService.createAccount(testUsername1, testPassword, testEmail, testAvatar1, testSecurityQuestion);
        const accountCreationError2 = await authService.createAccount(testUsername2, testPassword, testEmail, testAvatar2, testSecurityQuestion);

        accountCreated = accountCreationError === NO_ERROR;
        account2Created = accountCreationError2 === NO_ERROR;
        user1Id = await dbService.getUserId(testUsername1);
        user2Id = await dbService.getUserId(testUsername2);

        for (let i = 0; i < numberOfChatsToCreateForTest; i++) {
            const chatCreationResponse = await chatService.createChat(user1Id, testChatName, testChatType);
            chatIds.push(chatCreationResponse.chatId);
            if (i % 2 === 0) {
                await chatService.joinChat(user2Id, chatIds[i]);
            }
        }
    });

    afterEach(async () => {
        if (accountCreated) {
            await dbService.removeUserAccount(testUsername1);
            accountCreated = false;
        }

        if (account2Created) {
            await dbService.removeUserAccount(testUsername2);
            account2Created = false;
        }

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

    it('add a message to the chatHistory by the right user on addChatMessageToHistory()', async () => {
        const testChatPos = 0;
        const chatMessage: ChatMessage = {
            message: 'testMessage',
            username: testUsername1,
            avatar: testAvatar1,
            timestamp: '00',
        };
        const expectedChatMessage: ChatMessageDB = chatService['createChatMessageDB'](user1Id, chatMessage);

        await chatService.addChatMessageToHistory(user1Id, chatIds[testChatPos], chatMessage);
        expect(await dbService.getChatHistory(chatIds[testChatPos])).to.deep.contain(expectedChatMessage);
    });

    it('not add a message to the chatHistory if the user is not in chat addChatMessageToHistory()', async () => {
        const testChatPos = 1;
        const chatMessage: ChatMessage = {
            message: 'testMessage',
            username: testUsername2,
            avatar: testAvatar2,
            timestamp: '00',
        };
        const expectedChatMessage: ChatMessageDB = chatService['createChatMessageDB'](user2Id, chatMessage);

        await chatService.addChatMessageToHistory(user2Id, chatIds[testChatPos], chatMessage);
        expect(await dbService.getChatHistory(chatIds[testChatPos])).not.to.deep.contain(expectedChatMessage);
    });

    it('should have all the messages added in the chat history by the different users', async () => {
        const testChatPos = 0;
        const chatMessage: ChatMessage = {
            message: 'testMessage',
            username: testUsername2,
            avatar: testAvatar2,
            timestamp: '00',
        };
        const chatMessage2: ChatMessage = {
            message: 'testMessage',
            username: testUsername1,
            avatar: testAvatar1,
            timestamp: '11',
        };
        const chatMessage3: ChatMessage = {
            message: 'testMessage',
            username: testUsername2,
            avatar: testAvatar2,
            timestamp: '22',
        };
        const expectedChatMessage: ChatMessageDB = chatService['createChatMessageDB'](user2Id, chatMessage);
        const expectedChatMessage2: ChatMessageDB = chatService['createChatMessageDB'](user1Id, chatMessage2);
        const expectedChatMessage3: ChatMessageDB = chatService['createChatMessageDB'](user2Id, chatMessage3);

        await chatService.addChatMessageToHistory(user2Id, chatIds[testChatPos], chatMessage);
        await chatService.addChatMessageToHistory(user1Id, chatIds[testChatPos], chatMessage2);
        await chatService.addChatMessageToHistory(user2Id, chatIds[testChatPos], chatMessage3);

        expect(await dbService.getChatHistory(chatIds[testChatPos])).to.deep.contain(expectedChatMessage);
        expect(await dbService.getChatHistory(chatIds[testChatPos])).to.deep.contain(expectedChatMessage2);
        expect(await dbService.getChatHistory(chatIds[testChatPos])).to.deep.contain(expectedChatMessage3);
    });

    it('should convert the client version of messages and all messages on getChatHistory()', async () => {
        const testChatPos = 0;
        const chatMessage: ChatMessage = {
            message: 'testMessage',
            username: testUsername1,
            avatar: testAvatar1,
            timestamp: '00',
        };

        await chatService.addChatMessageToHistory(user1Id, chatIds[testChatPos], chatMessage);
        expect(await chatService.getChatHistory(chatIds[testChatPos])).to.deep.contain(chatMessage);
    });

    it('should return all messages sent and converted to client version on on getChatHistory()', async () => {
        const testChatPos = 0;
        const chatMessage: ChatMessage = {
            message: 'testMessage',
            username: testUsername2,
            avatar: testAvatar2,
            timestamp: '00',
        };
        const chatMessage2: ChatMessage = {
            message: 'testMessage',
            username: testUsername1,
            avatar: testAvatar1,
            timestamp: '11',
        };
        const chatMessage3: ChatMessage = {
            message: 'testMessage',
            username: testUsername2,
            avatar: testAvatar2,
            timestamp: '22',
        };

        await chatService.addChatMessageToHistory(user2Id, chatIds[testChatPos], chatMessage);
        await chatService.addChatMessageToHistory(user1Id, chatIds[testChatPos], chatMessage2);
        await chatService.addChatMessageToHistory(user2Id, chatIds[testChatPos], chatMessage3);

        expect(await chatService.getChatHistory(chatIds[testChatPos])).to.deep.contain(chatMessage);
        expect(await chatService.getChatHistory(chatIds[testChatPos])).to.deep.contain(chatMessage2);
        expect(await chatService.getChatHistory(chatIds[testChatPos])).to.deep.contain(chatMessage3);
    });
});
