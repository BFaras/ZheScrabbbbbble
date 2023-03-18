import { ConnectivityStatus, UserStatus } from '@app/interfaces/friend-info';
import { Subject } from 'rxjs';
import * as io from 'socket.io';
import { Service } from 'typedi';

@Service()
export class UsersStatusService {
    private readonly onlineUsers: Map<string, io.Socket>;
    private readonly usersInGame: Set<string>;
    private readonly statusUpdater: Subject<UserStatus>;

    constructor() {
        this.onlineUsers = new Map<string, io.Socket>();
        this.usersInGame = new Set<string>();
        this.statusUpdater = new Subject<UserStatus>();
    }

    addOnlineUser(userId: string, socket: io.Socket) {
        if (this.isUserOnline(userId)) {
            this.removeOnlineUser(userId);
        }
        this.onlineUsers.set(userId, socket);
        this.statusUpdater.next({ userId, status: ConnectivityStatus.ONLINE });
    }

    removeOnlineUser(userId: string) {
        this.onlineUsers.delete(userId);
        this.statusUpdater.next({ userId, status: ConnectivityStatus.OFFLINE });
    }

    isUserOnline(userId: string): boolean {
        return this.onlineUsers.has(userId);
    }

    getUserSocketFromId(userId: string): io.Socket | undefined {
        return this.onlineUsers.get(userId);
    }

    addUserToInGameList(userId: string) {
        if (this.isUserOnline(userId)) {
            this.usersInGame.add(userId);
            this.statusUpdater.next({ userId, status: ConnectivityStatus.INGAME });
        }
    }

    removeUserFromInGameList(userId: string) {
        if (this.isUserOnline(userId)) {
            this.usersInGame.delete(userId);
            this.statusUpdater.next({ userId, status: ConnectivityStatus.ONLINE });
        }
    }

    isUserInGame(userId: string): boolean {
        return this.usersInGame.has(userId);
    }

    getStatusUpdater(): Subject<UserStatus> {
        return this.statusUpdater;
    }
}
