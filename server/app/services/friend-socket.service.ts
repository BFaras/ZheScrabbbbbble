import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { FriendService } from './friend.service';

@Service()
export class FriendSocketService {
    private readonly friendService: FriendService;
    private readonly accountInfoService: AccountInfoService;

    constructor() {
        this.friendService = Container.get(FriendService);
        this.accountInfoService = Container.get(AccountInfoService);
    }

    handleFriendSockets(socket: io.Socket) {
        socket.on('Get Profile Information', async () => {});
    }
}
