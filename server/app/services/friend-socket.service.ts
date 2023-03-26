import { NO_ERROR } from '@app/constants/error-code-constants';
import { ChatCreationResponse } from '@app/interfaces/chat-info';
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
            const friendsAddResp: ChatCreationResponse = await this.friendService.addFriend(this.accountInfoService.getUserId(socket), friendCode);

            if (friendsAddResp.errorCode === NO_ERROR) {
                this.modifyFriendsSocket(socket, await this.friendService.getFriendIdFromCode(friendCode), true, friendsAddResp.chatId);
            }

            socket.emit('Send Request Response', friendsAddResp.errorCode);
        });

        socket.on('Remove Friend', async (friendUsername: string) => {
            const friendUserId = await this.dbService.getUserId(friendUsername);
            const friendsLeaveResp: ChatCreationResponse = await this.friendService.removeFriend(
                this.accountInfoService.getUserId(socket),
                friendUserId,
            );

            if (friendsLeaveResp.errorCode === NO_ERROR) {
                this.modifyFriendsSocket(socket, friendUserId, false, friendsLeaveResp.chatId);
            }

            socket.emit('Remove Friend Response', friendsLeaveResp.errorCode);
        });
    }

    updateFriendsWithNewUsername(oldUsername: string, newUsername: string, userId: string) {
        this.sio?.in(this.friendService.getFriendRoomName(userId)).emit('Friend Username Updated', oldUsername, newUsername);
    }

    private async updateFriendsWithNewStatus(userStatus: UserStatus) {
        const username: string = await this.dbService.getUsernameFromId(userStatus.userId);
        this.sio?.in(this.friendService.getFriendRoomName(userStatus.userId)).emit('Update friend status', username, userStatus.status);
    }

    private async modifyFriendsSocket(socket: io.Socket, friendUserId: string, isAddFriend: boolean, friendChatId: string) {
        const friendRoomName = this.friendService.getFriendRoomName(friendUserId);
        if (isAddFriend) {
            socket.join(friendRoomName);
            socket.join(friendChatId);
        } else {
            socket.leave(friendRoomName);
            socket.leave(friendChatId);
        }

        if (this.usersStatusService.isUserOnline(friendUserId)) {
            const userSocket: io.Socket | undefined = this.usersStatusService.getUserSocketFromId(friendUserId);
            const userRoomName = this.friendService.getFriendRoomName(this.accountInfoService.getUserId(socket));
            if (isAddFriend) {
                userSocket?.join(userRoomName);
                userSocket?.join(friendChatId);
            } else {
                userSocket?.leave(userRoomName);
                userSocket?.leave(friendChatId);
            }
        }
    }
}
