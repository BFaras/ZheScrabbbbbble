import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { ProfileService } from './profile.service';

@Service()
export class ProfileSocketService {
    private readonly profileService: ProfileService;
    private readonly accountInfoService: AccountInfoService;

    constructor() {
        this.profileService = Container.get(ProfileService);
        this.accountInfoService = Container.get(AccountInfoService);
    }

    handleProfileSockets(socket: io.Socket) {
        socket.on('Get Profile Information', async (username: string) => {
            socket.emit('User Profile Response', await this.profileService.getProfileInformation(username));
        });

        socket.on('Change Avatar', async (newAvatar: string) => {
            socket.emit('Avatar Change Response', await this.profileService.changeAvatar(this.accountInfoService.getUserId(socket), newAvatar));
        });
    }
}
