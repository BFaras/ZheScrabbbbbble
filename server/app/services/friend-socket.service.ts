import { INVALID_DATA_SENT, NO_ERROR, NO_USER_CONNECTED } from '@app/constants/error-code-constants';
import { UserStatus } from '@app/interfaces/friend-info';
import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { DatabaseService } from './database.service';
import { FriendService } from './friend.service';
import { UsersStatusService } from './users-status.service';

@Service()
export class FriendSocketService {
    private readonly friendService: FriendService;
    private readonly accountInfoService: AccountInfoService;
    private readonly usersStatusService: UsersStatusService;
    private readonly dbService: DatabaseService;
    private sio: io.Server;

    constructor() {
        this.friendService = Container.get(FriendService);
        this.accountInfoService = Container.get(AccountInfoService);
        this.usersStatusService = Container.get(UsersStatusService);
        this.dbService = Container.get(DatabaseService);

        this.usersStatusService.getStatusUpdater().subscribe({
            next: this.updateFriendsWithNewStatus.bind(this),
        });
    }

    setSio(sio: io.Server) {
        this.sio = sio;
    }

    handleFriendSockets(socket: io.Socket) {
        socket.on('Get Friend List', async () => {
            const userId = this.accountInfoService.getUserId(socket);
            if (userId) {
                socket.emit('Friend List Response', await this.friendService.getFriendList(userId));
            } else {
                socket.emit('Friend List Response', NO_USER_CONNECTED);
            }
        });

        socket.on('Send Friend Request', async (friendCode: string) => {
            const userId = this.accountInfoService.getUserId(socket);
            if (friendCode && userId) {
                const errorCode: string = await this.friendService.addFriend(userId, friendCode);
                socket.emit('Send Request Response', errorCode);
            } else {
                socket.emit('Send Request Response', INVALID_DATA_SENT);
            }
        });

        socket.on('Remove Friend', async (friendUsername: string) => {
            const userId = this.accountInfoService.getUserId(socket);
            const friendUserId = await this.dbService.getUserId(friendUsername);
            if (userId && friendUserId) {
                const errorCode: string = await this.friendService.removeFriend(userId, friendUserId);

                if (errorCode === NO_ERROR) {
                    this.updateFriendRemovedAsFriend(friendUserId, this.accountInfoService.getUsername(socket));
                }

                socket.emit('Remove Friend Response', errorCode);
            } else {
                socket.emit('Remove Friend Response', INVALID_DATA_SENT);
            }
        });
    }

    updateFriendsWithNewUsername(oldUsername: string, newUsername: string, userId: string) {
        this.sio?.in(this.friendService.getFriendRoomName(userId)).emit('Friend Username Updated', oldUsername, newUsername);
    }

    private async updateFriendsWithNewStatus(userStatus: UserStatus) {
        const username: string = await this.dbService.getUsernameFromId(userStatus.userId);
        this.sio?.in(this.friendService.getFriendRoomName(userStatus.userId)).emit('Update friend status', username, userStatus.status);
    }

    private async updateFriendRemovedAsFriend(userId: string, usernameOfFriend: string) {
        if (this.usersStatusService.isUserOnline(userId)) {
            console.log('REMOVED');
            this.usersStatusService.getUserSocketFromId(userId)?.emit('Friend removed you as friend', usernameOfFriend);
        }
    }
}
