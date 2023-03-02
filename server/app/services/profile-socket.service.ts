import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { ProfileService } from './profile.service';

@Service()
export class ProfileSocketService {
    private readonly profileService: ProfileService;

    constructor() {
        this.profileService = Container.get(ProfileService);
    }

    handleProfileSockets(socket: io.Socket) {
        socket.on('Get Profile Information', async (username: string) => {
            socket.emit('User Profile Response', await this.profileService.getProfileInformation(username));
        });
    }
}
