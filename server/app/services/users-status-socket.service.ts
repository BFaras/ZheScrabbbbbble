import { FRIEND_ROOM_BASE_NAME } from '@app/constants/profile-constants';
import { ConnectivityStatus } from '@app/interfaces/friend-info';
import * as io from 'socket.io';
import { Service } from 'typedi';

@Service()
export class UsersStatusSocketService {
    private sio: io.Server;

    setupUserStatusSocketService(sio: io.Server) {
        this.sio = sio;
    }

    updateFriendsWithNewStatus(userId: string, newUserStatus: ConnectivityStatus) {
        this.sio?.in(FRIEND_ROOM_BASE_NAME + userId).emit('Update friend status', newUserStatus);
    }
}
