import { Service } from 'typedi';

@Service()
export class OnlineUsersService {
    private readonly onlineUsers: Set<string>;
    private readonly usersInGame: Set<string>;

    constructor() {
        this.onlineUsers = new Set<string>();
    }

    addOnlineUser(userId: string) {
        this.onlineUsers.add(userId);
    }

    removeOnlineUser(userId: string) {
        this.onlineUsers.delete(userId);
    }

    isUserOnline(userId: string): boolean {
        return this.onlineUsers.has(userId);
    }

    addUserToInGameList(userId: string) {
        this.usersInGame.add(userId);
    }

    removeUserFromInGameList(userId: string) {
        this.usersInGame.delete(userId);
    }

    isUserInGame(userId: string): boolean {
        return this.usersInGame.has(userId);
    }
}
