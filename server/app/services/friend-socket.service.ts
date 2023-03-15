import { ConnectivityStatus } from '@app/interfaces/friend-info';
import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { FriendService } from './friend.service';
import { UsersStatusService } from './users-status.service';

@Service()
export class FriendSocketService {
    private readonly friendService: FriendService;
    private readonly accountInfoService: AccountInfoService;
    private readonly usersStatusService: UsersStatusService;
    private sio: io.Server;

    constructor() {
        this.friendService = Container.get(FriendService);
        this.accountInfoService = Container.get(AccountInfoService);
        this.usersStatusService = Container.get(UsersStatusService);
    }

    handleFriendSockets(socket: io.Socket, sio: io.Server) {
        this.sio = sio;
        socket.on('Get Friend List', async () => {
            socket.emit('Friend List Response', this.friendService.getFriendList(this.accountInfoService.getUserId(socket)));
        });

        socket.on('Send Friend Request', async (friendCode: string) => {
            socket.emit('Send Request Response', this.friendService.addFriend(this.accountInfoService.getUserId(socket), friendCode));
        });
    }

    async updateFriendsWithNewStatus(userId: string, newUserStatus: ConnectivityStatus) {
        this.sio.in(this.friendService.getFriendRoomName(userId)).emit('Update friend status', newUserStatus);
    }

    private async addFriendsToSocket(socket: io.Socket, friendUserId: string) {
        socket.join(this.friendService.getFriendRoomName(friendUserId));

        if (this.usersStatusService.isUserOnline(friendUserId)) {
            this.usersStatusService
                .getUserSocketFromId(friendUserId)
                .join(this.friendService.getFriendRoomName(this.accountInfoService.getUserId(socket)));
        }
    }
}
