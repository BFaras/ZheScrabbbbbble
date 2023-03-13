import { MAX_ASCII_SYMBOL, MIN_ASCII_SYMBOL } from '@app/constants/authentification-constants';
import { FRIEND_CODE_LENGTH } from '@app/constants/profile-constants';
import { ConnectivityStatus, Friend } from '@app/interfaces/friend-info';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';
import { OnlineUsersService } from './online-users.service';

@Service()
export class FriendService {
    private readonly dbService: DatabaseService;
    private readonly onlineUsersService: OnlineUsersService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
        this.onlineUsersService = Container.get(OnlineUsersService);
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

    async isFriendCodeExistant(userFriendCode: string): Promise<boolean> {
        return await this.dbService.isFriendCodeTaken(userFriendCode);
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

        if (this.onlineUsersService.isUserOnline(userId)) {
            userStatus = ConnectivityStatus.ONLINE;
            if (this.onlineUsersService.isUserInGame(userId)) {
                userStatus = ConnectivityStatus.INGAME;
            }
        }
        return userStatus;
    }
}
