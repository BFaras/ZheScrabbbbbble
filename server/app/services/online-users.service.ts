import { Service } from 'typedi';

@Service()
export class OnlineUsersService {
    private readonly onlineUsers: Set<string>;

    constructor() {
        this.onlineUsers = new Set<string>();
    }

    addOnlineUser(username: string) {
        this.onlineUsers.add(username);
    }

    removeOnlineUser(username: string) {
        this.onlineUsers.delete(username);
    }

    isUserOnline(username: string): boolean {
        return this.onlineUsers.has(username);
    }
}
