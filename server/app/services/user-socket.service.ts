import * as io from 'socket.io';
import Container, { Service } from 'typedi';
import { UsersStatusService } from './users-status.service';

@Service()
export class UserSocketService {
    private readonly usersStatusService: UsersStatusService;

    constructor() {
        this.usersStatusService = Container.get(UsersStatusService);
    }

    userSocketJoinRoom(userId: string, roomId: string) {
        const userSocket: io.Socket | undefined = this.getUserSocket(userId);
        if (userSocket && !userSocket?.rooms.has(roomId)) {
            userSocket?.join(roomId);
        }
    }

    userSocketLeaveRoom(userId: string, roomId: string) {
        const userSocket: io.Socket | undefined = this.getUserSocket(userId);
        userSocket?.leave(roomId);
    }

    private getUserSocket(userId: string): io.Socket | undefined {
        if (this.usersStatusService.isUserOnline(userId)) {
            return this.usersStatusService.getUserSocketFromId(userId);
        }
        return undefined;
    }
}
