import { NO_ERROR } from '@app/constants/error-code-constants';
import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { FriendSocketService } from './friend-socket.service';
import { ProfileService } from './profile.service';

@Service()
export class ProfileSocketService {
    private readonly profileService: ProfileService;
    private readonly accountInfoService: AccountInfoService;
    private readonly friendSocketService: FriendSocketService;

    constructor() {
        this.profileService = Container.get(ProfileService);
        this.accountInfoService = Container.get(AccountInfoService);
        this.friendSocketService = Container.get(FriendSocketService);
    }

    handleProfileSockets(socket: io.Socket) {
        socket.on('Get Profile Information', async (username: string) => {
            socket.emit('User Profile Response', await this.profileService.getProfileInformation(username));
        });

        socket.on('Change Avatar', async (newAvatar: string) => {
            socket.emit('Avatar Change Response', await this.profileService.changeAvatar(this.accountInfoService.getUserId(socket), newAvatar));
        });

        socket.on('Get Theme and Language', async () => {
            const userSettings = await this.profileService.getUserSettings(this.accountInfoService.getUserId(socket));
            socket.emit('Theme and Language Response', userSettings.theme, userSettings.language);
        });

        socket.on('Change Theme', async (newTheme: string) => {
            socket.emit(
                'Theme Change Response',
                await this.profileService.changeUserSettings(this.accountInfoService.getUserId(socket), newTheme, true),
            );
        });

        socket.on('Change Username', async (newUsername: string) => {
            const oldUsername = this.accountInfoService.getUsername(socket);
            const userId = this.accountInfoService.getUserId(socket);
            const usernameChangeError = await this.profileService.changeUsername(userId, newUsername);

            if (usernameChangeError === NO_ERROR) {
                this.accountInfoService.setUsername(socket, newUsername);
                this.friendSocketService.updateFriendsWithNewUsername(oldUsername, newUsername, userId);
            }
            socket.emit('Username Change Response', usernameChangeError);
        });

        socket.on('Get Theme and Language', async () => {
            const userSettings = await this.profileService.getUserSettings(this.accountInfoService.getUserId(socket));
            socket.emit('Theme and Language Response', userSettings.theme, userSettings.language);
        });
    }
}
