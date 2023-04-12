import { DATABASE_UNAVAILABLE, NO_ERROR, WRONG_FRIEND_CODE } from '@app/constants/error-code-constants';
import { FRIEND_CODE_LENGTH, FRIEND_ROOM_BASE_NAME } from '@app/constants/profile-constants';
import { ConnectivityStatus, Friend } from '@app/interfaces/friend-info';
import { Container, Service } from 'typedi';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';
import { UserSocketService } from './user-socket.service';
import { UsersStatusService } from './users-status.service';
import crypto = require('crypto');

@Service()
export class FriendService {
    private readonly dbService: DatabaseService;
    private readonly usersStatusService: UsersStatusService;
    private readonly chatService: ChatService;
    private userSocketService: UserSocketService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
        this.usersStatusService = Container.get(UsersStatusService);
        this.chatService = Container.get(ChatService);
        this.userSocketService = Container.get(UserSocketService);
    }

    async generateUniqueFriendCode(): Promise<string> {
        let userFriendCode: string = this.generateFriendCode();

        while (await this.isFriendCodeExistant(userFriendCode)) {
            userFriendCode = this.generateFriendCode();
        }
        return userFriendCode;
    }

    async getFriendList(userId: string): Promise<Friend[]> {
        const friendsIds = await this.dbService.getUserFriendList(userId);
        return await this.generateFriendList(friendsIds);
    }

    async getFriendsIds(userId: string): Promise<string[]> {
        return await this.dbService.getUserFriendList(userId);
    }

    async getFriendIdFromCode(friendCode: string): Promise<string> {
        return await this.dbService.getUserIdFromFriendCode(friendCode);
    }

    async addFriend(userId: string, friendCode: string): Promise<string> {
        let errorCode: string = WRONG_FRIEND_CODE;
        if (await this.isFriendCodeExistant(friendCode)) {
            const friendUserId: string = await this.dbService.getUserIdFromFriendCode(friendCode);

            errorCode = DATABASE_UNAVAILABLE;

            if (friendUserId !== '' && friendUserId !== userId) {
                errorCode = await this.dbService.addFriend(userId, friendUserId);
                errorCode = await this.dbService.addFriend(friendUserId, userId);
                if (errorCode === NO_ERROR) {
                    errorCode = await this.chatService.createFriendsChat(userId, friendUserId);
                    this.userSocketService.userSocketJoinRoom(userId, this.getFriendRoomName(friendUserId));
                    this.userSocketService.userSocketJoinRoom(friendUserId, this.getFriendRoomName(userId));
                }
            }
        }
        return errorCode;
    }

    async removeFriend(userId: string, friendUserId: string): Promise<string> {
        let errorCode: string = DATABASE_UNAVAILABLE;

        if (friendUserId !== '') {
            errorCode = await this.dbService.removeFriend(userId, friendUserId);
            errorCode = await this.dbService.removeFriend(friendUserId, userId);
            if (errorCode === NO_ERROR) {
                errorCode = await this.chatService.removeFriendsChat(userId, friendUserId);
                this.userSocketService.userSocketLeaveRoom(userId, this.getFriendRoomName(friendUserId));
                this.userSocketService.userSocketLeaveRoom(friendUserId, this.getFriendRoomName(userId));
            }
        }
        return errorCode;
    }

    async isFriendCodeExistant(userFriendCode: string): Promise<boolean> {
        return await this.dbService.isFriendCodeTaken(userFriendCode);
    }

    getFriendRoomName(friendId: string): string {
        return FRIEND_ROOM_BASE_NAME + friendId;
    }

    private generateFriendCode(): string {
        return 'Friend' + crypto.randomBytes(FRIEND_CODE_LENGTH / 2).toString('hex');
    }

    private async generateFriendList(friendsIds: string[]): Promise<Friend[]> {
        const friendsList: Friend[] = [];
        for (const friendId of friendsIds) {
            friendsList.push({ username: await this.dbService.getUsernameFromId(friendId), status: this.getUserStatus(friendId) });
        }

        return Promise.resolve(friendsList);
    }

    private getUserStatus(userId: string): ConnectivityStatus {
        let userStatus = ConnectivityStatus.OFFLINE;

        if (this.usersStatusService.isUserOnline(userId)) {
            userStatus = ConnectivityStatus.ONLINE;
            if (this.usersStatusService.isUserInGame(userId)) {
                userStatus = ConnectivityStatus.INGAME;
            }
        }
        return userStatus;
    }
}
