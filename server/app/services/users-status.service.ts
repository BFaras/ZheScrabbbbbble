import { ConnectivityStatus } from '@app/interfaces/friend-info';
import * as io from 'socket.io';
import Container, { Service } from 'typedi';
import { UsersStatusSocketService } from './users-status-socket.service';

@Service()
export class UsersStatusService {
    private readonly userStatusSocketService: UsersStatusSocketService;
    private readonly onlineUsers: Map<string, io.Socket>;
    private readonly usersInGame: Set<string>;

    constructor() {
        this.userStatusSocketService = Container.get(UsersStatusSocketService);
        this.onlineUsers = new Map<string, io.Socket>();
        this.usersInGame = new Set<string>();
    }

    addOnlineUser(userId: string, socket: io.Socket) {
        if (this.isUserOnline(userId)) {
            this.removeOnlineUser(userId);
        }
        this.onlineUsers.set(userId, socket);
        this.userStatusSocketService.updateFriendsWithNewStatus(userId, ConnectivityStatus.ONLINE);
    }

    removeOnlineUser(userId: string) {
        this.onlineUsers.delete(userId);
        this.userStatusSocketService.updateFriendsWithNewStatus(userId, ConnectivityStatus.OFFLINE);
    }

    isUserOnline(userId: string): boolean {
        return this.onlineUsers.has(userId);
    }

    getUserSocketFromId(userId: string): io.Socket | undefined {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.onlineUsers.get(userId);
    }

    addUserToInGameList(userId: string) {
        if (this.isUserOnline(userId)) {
            this.usersInGame.add(userId);
            this.userStatusSocketService.updateFriendsWithNewStatus(userId, ConnectivityStatus.INGAME);
        }
    }

    removeUserFromInGameList(userId: string) {
        if (this.isUserOnline(userId)) {
            this.usersInGame.delete(userId);
            this.userStatusSocketService.updateFriendsWithNewStatus(userId, ConnectivityStatus.ONLINE);
        }
    }

    isUserInGame(userId: string): boolean {
        return this.usersInGame.has(userId);
    }
}
