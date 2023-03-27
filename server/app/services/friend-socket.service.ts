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
            socket.emit('Friend List Response', this.friendService.getFriendList(this.accountInfoService.getUserId(socket)));
        });

        socket.on('Send Friend Request', async (friendCode: string) => {
            const errorCode: string = await this.friendService.addFriend(this.accountInfoService.getUserId(socket), friendCode);
            socket.emit('Send Request Response', errorCode);
        });

        socket.on('Remove Friend', async (friendUsername: string) => {
            const friendUserId = await this.dbService.getUserId(friendUsername);
            const errorCode: string = await this.friendService.removeFriend(this.accountInfoService.getUserId(socket), friendUserId);

            socket.emit('Remove Friend Response', errorCode);
        });
    }

    updateFriendsWithNewUsername(oldUsername: string, newUsername: string, userId: string) {
        this.sio?.in(this.friendService.getFriendRoomName(userId)).emit('Friend Username Updated', oldUsername, newUsername);
    }

    private async updateFriendsWithNewStatus(userStatus: UserStatus) {
        const username: string = await this.dbService.getUsernameFromId(userStatus.userId);
        this.sio?.in(this.friendService.getFriendRoomName(userStatus.userId)).emit('Update friend status', username, userStatus.status);
    }
}
