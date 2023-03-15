import { MAX_ASCII_SYMBOL, MIN_ASCII_SYMBOL } from '@app/constants/authentification-constants';
import { DATABASE_UNAVAILABLE, WRONG_FRIEND_CODE } from '@app/constants/error-code-constants';
import { FRIEND_CODE_LENGTH, FRIEND_ROOM_BASE_NAME } from '@app/constants/profile-constants';
import { ConnectivityStatus, Friend } from '@app/interfaces/friend-info';
import { Container, Service } from 'typedi';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';
import { UsersStatusService } from './users-status.service';

@Service()
export class FriendService {
    private readonly dbService: DatabaseService;
    private readonly usersStatusService: UsersStatusService;
    private readonly chatService: ChatService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
        this.usersStatusService = Container.get(UsersStatusService);
        this.chatService = Container.get(ChatService);
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
        return this.generateFriendList(friendsIds);
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

            if (friendUserId !== '') {
                errorCode = await this.dbService.addFriend(userId, friendUserId);
                errorCode = await this.dbService.addFriend(friendUserId, userId);
                errorCode = await this.chatService.createFriendsChat(userId, friendUserId);
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
        let generatedFriendCode = 'Friend';

        for (let i = 0; i < FRIEND_CODE_LENGTH; i++) {
            const randomCharCode = Math.floor(Math.random() * (MAX_ASCII_SYMBOL + 1)) + MIN_ASCII_SYMBOL;
            generatedFriendCode += String.fromCharCode(randomCharCode);
        }

        return generatedFriendCode;
    }

    private async generateFriendList(friendsIds: string[]): Promise<Friend[]> {
        const friendsList: Friend[] = [];
        friendsIds.forEach(async (friendId: string) => {
            friendsList.push({ username: await this.dbService.getUsernameFromId(friendId), status: this.getUserStatus(friendId) });
        });

        return friendsList;
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
