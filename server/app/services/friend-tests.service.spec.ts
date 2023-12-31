/* eslint-disable dot-notation */
/* eslint-disable max-len */
import { ServerSocketTestHelper } from '@app/classes/server-socket-test-helper';
import { NO_ERROR } from '@app/constants/error-code-constants';
import { ConnectivityStatus, Friend } from '@app/interfaces/friend-info';
import { Question } from '@app/interfaces/question';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as io from 'socket.io';
import { Container } from 'typedi';
import { AuthentificationService } from './authentification.service';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';
import { FriendService } from './friend.service';
import { ProfileService } from './profile.service';
import { UsersStatusService } from './users-status.service';

describe('Friend Tests', async () => {
    const testUsername = 'testUser157Test';
    const testUsername2 = 'Test2User';
    const testPassword = 'tE!s&to~';
    const testEmail = 'myTestMail12564@poly.com';
    const testAvatar = 'av111';
    const testSecurityQuestion: Question = { question: 'Who are you?', answer: 'Me' };

    let mongoServer: MongoMemoryServer;
    let dbService: DatabaseService;
    let authService: AuthentificationService;
    let profileService: ProfileService;
    let friendService: FriendService;
    let usersStatusService: UsersStatusService;
    let chatService: ChatService;

    let accountCreated = false;
    let account2Created = false;
    let user1Id = '';
    let user2Id = '';
    let user1FriendCode = '';
    let user2FriendCode = '';
    let user1Socket: io.Socket;
    let user2Socket: io.Socket;

    before(async () => {
        dbService = Container.get(DatabaseService);
        mongoServer = new MongoMemoryServer();
        await dbService.start(await mongoServer.getUri());
    });

    beforeEach(async () => {
        authService = Container.get(AuthentificationService);
        profileService = Container.get(ProfileService);
        friendService = Container.get(FriendService);
        usersStatusService = Container.get(UsersStatusService);
        chatService = Container.get(ChatService);

        const accountCreationError = await authService.createAccount(testUsername, testPassword, testEmail, testAvatar, testSecurityQuestion);
        const accountCreationError2 = await authService.createAccount(testUsername2, testPassword, testEmail, testAvatar, testSecurityQuestion);

        accountCreated = accountCreationError === NO_ERROR;
        account2Created = accountCreationError2 === NO_ERROR;
        user1Id = await dbService.getUserId(testUsername);
        user2Id = await dbService.getUserId(testUsername2);
        user1FriendCode = (await profileService.getProfileInformation(testUsername)).userCode;
        user2FriendCode = (await profileService.getProfileInformation(testUsername2)).userCode;
        user1Socket = new ServerSocketTestHelper('fdsjhshdf464fds65') as unknown as io.Socket;
        user2Socket = new ServerSocketTestHelper('uusahdsfnbnsah89') as unknown as io.Socket;
        usersStatusService.addOnlineUser(user1Id, user1Socket);
        usersStatusService.addOnlineUser(user2Id, user2Socket);
    });

    afterEach(async () => {
        if (accountCreated) {
            await dbService.removeUserAccount(testUsername);
            accountCreated = false;
        }

        if (account2Created) {
            await dbService.removeUserAccount(testUsername2);
            account2Created = false;
        }
    });

    after(async () => {
        if (dbService['client']) {
            await dbService['client'].close();
        }
    });

    it('should return true if the friend code already exists on isFriendCodeExistant()', async () => {
        const userFriendCode: string = (await profileService.getProfileInformation(testUsername)).userCode;
        expect(await friendService.isFriendCodeExistant(userFriendCode)).to.be.true;
    });

    it('should return false if the friend code doesnt exist on isFriendCodeExistant()', async () => {
        const randomInexsitantCode = 'DJS45sa';
        expect(await friendService.isFriendCodeExistant(randomInexsitantCode)).to.be.false;
    });

    it('should return the userId on getFriendIdFromCode()', async () => {
        expect(await friendService.getFriendIdFromCode(user1FriendCode)).to.equal(user1Id);
    });

    it('should add a friend id to the list for both accounts that are friends on addFriend()', async () => {
        await friendService.addFriend(user1Id, user2FriendCode);

        const user1FriendIdList: string[] = await friendService.getFriendsIds(user1Id);
        const user2FriendIdList: string[] = await friendService.getFriendsIds(user2Id);

        expect(user1FriendIdList).to.contain(user2Id);
        expect(user2FriendIdList).to.contain(user1Id);
    });

    it('should add the friends sockets from friends chat and friend socket addFriend()', async () => {
        const user1FriendRoom = friendService.getFriendRoomName(user1Id);
        const user2FriendRoom = friendService.getFriendRoomName(user2Id);
        await friendService.addFriend(user1Id, user2FriendCode);

        const chatId: string = await dbService.getFriendChatId(
            chatService['getFriendChatName'](user1Id, user2Id),
            chatService['getFriendChatName'](user2Id, user1Id),
        );

        expect(user1Socket.rooms.has(chatService.getChatRoomName(chatId))).to.be.true;
        expect(user2Socket.rooms.has(chatService.getChatRoomName(chatId))).to.be.true;
        expect(user1Socket.rooms.has(user2FriendRoom)).to.be.true;
        expect(user2Socket.rooms.has(user1FriendRoom)).to.be.true;
    });

    it('should create the friends chat on addFriend()', async () => {
        await friendService.addFriend(user1Id, user2FriendCode);

        const chatId: string = await dbService.getFriendChatId(
            chatService['getFriendChatName'](user1Id, user2Id),
            chatService['getFriendChatName'](user2Id, user1Id),
        );

        expect(await dbService.isChatExistant(chatId)).to.be.true;
    });

    it('should get the friends list with the friends right info and username on getFriendList()', async () => {
        const expectedUser1Friend: Friend = {
            username: testUsername2,
            status: ConnectivityStatus.ONLINE,
        };
        const expectedUser2Friend: Friend = {
            username: testUsername,
            status: ConnectivityStatus.ONLINE,
        };

        await friendService.addFriend(user1Id, user2FriendCode);

        const user1FriendList: Friend[] = await friendService.getFriendList(user1Id);
        const user2FriendList: Friend[] = await friendService.getFriendList(user2Id);

        expect(user1FriendList[0]).to.deep.equals(expectedUser1Friend);
        expect(user2FriendList[0]).to.deep.equals(expectedUser2Friend);
    });

    it('should return the right user status if the user is offline', async () => {
        await friendService.addFriend(user1Id, user2FriendCode);
        usersStatusService.removeOnlineUser(user2Id);

        const user1FriendList: Friend[] = await friendService.getFriendList(user1Id);

        expect(user1FriendList[0].status).to.deep.equals(ConnectivityStatus.OFFLINE);
    });

    it('should return the right user status if the user is in game', async () => {
        await friendService.addFriend(user1Id, user2FriendCode);
        usersStatusService.addUserToInGameList(user2Id);

        const user1FriendList: Friend[] = await friendService.getFriendList(user1Id);

        expect(user1FriendList[0].status).to.deep.equals(ConnectivityStatus.INGAME);
    });

    it('should remove a friend from the friend list on removeFriend()', async () => {
        await friendService.addFriend(user1Id, user2FriendCode);
        await friendService.removeFriend(user1Id, user2Id);

        const user1FriendInterface: Friend = { username: testUsername, status: ConnectivityStatus.ONLINE };
        const user2FriendInterface: Friend = { username: testUsername2, status: ConnectivityStatus.ONLINE };
        const user1FriendList: Friend[] = await friendService.getFriendList(user1Id);
        const user2FriendList: Friend[] = await friendService.getFriendList(user2Id);

        expect(user1FriendList).not.to.deep.contain(user2FriendInterface);
        expect(user2FriendList).not.to.deep.contain(user1FriendInterface);
    });

    it('should remove a friend from the friend list even if we reverse the user Ids on removeFriend()', async () => {
        await friendService.addFriend(user1Id, user2FriendCode);
        await friendService.removeFriend(user2Id, user1Id);

        const user1FriendInterface: Friend = { username: testUsername, status: ConnectivityStatus.ONLINE };
        const user2FriendInterface: Friend = { username: testUsername2, status: ConnectivityStatus.ONLINE };
        const user1FriendList: Friend[] = await friendService.getFriendList(user1Id);
        const user2FriendList: Friend[] = await friendService.getFriendList(user2Id);

        expect(user1FriendList).not.to.deep.contain(user2FriendInterface);
        expect(user2FriendList).not.to.deep.contain(user1FriendInterface);
    });

    it('should remove the friends chat on removeFriend()', async () => {
        await friendService.addFriend(user1Id, user2FriendCode);

        const chatId: string = await dbService.getFriendChatId(
            chatService['getFriendChatName'](user1Id, user2Id),
            chatService['getFriendChatName'](user2Id, user1Id),
        );

        await friendService.removeFriend(user1Id, user2Id);

        expect(await dbService.isChatExistant(chatId)).to.be.false;
    });

    it('should remove the friends sockets from friends chat and friend socket removeFriend()', async () => {
        const user1FriendRoom = friendService.getFriendRoomName(user1Id);
        const user2FriendRoom = friendService.getFriendRoomName(user2Id);
        await friendService.addFriend(user1Id, user2FriendCode);

        const chatId: string = await dbService.getFriendChatId(
            chatService['getFriendChatName'](user1Id, user2Id),
            chatService['getFriendChatName'](user2Id, user1Id),
        );
        await friendService.removeFriend(user1Id, user2Id);

        expect(user1Socket.rooms.has(chatService.getChatRoomName(chatId))).to.be.false;
        expect(user2Socket.rooms.has(chatService.getChatRoomName(chatId))).to.be.false;
        expect(user1Socket.rooms.has(user2FriendRoom)).to.be.false;
        expect(user2Socket.rooms.has(user1FriendRoom)).to.be.false;
    });
});
