import { DATABASE_UNAVAILABLE, NO_ERROR } from '@app/constants/error-code-constants';
import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { FriendSocketService } from './friend-socket.service';
import { ProfileService } from './profile.service';
/* const fs = require('fs');*/
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
            if (username !== '' && username !== undefined && username !== null) {
                socket.emit('User Profile Response', await this.profileService.getProfileInformation(username));
            } else {
                socket.emit('User Profile Response', DATABASE_UNAVAILABLE);
            }
        });
        /** *Ajouter tous les avatars */
        socket.on('Get All Users Avatar Information', async (usernames: string[]) => {
            const avatars: string[] = [];
            if (usernames !== null && usernames !== undefined) {
                for (const username of usernames) {
                    if (username !== '' && username !== undefined && username !== null) {
                        console.log('test1');
                        avatars.push((await this.profileService.getProfileInformation(username)).avatar);
                    } else {
                        console.log('test2');
                        socket.emit('Get All Users Avatar Information Response', DATABASE_UNAVAILABLE);
                    }
                }
                console.log('test3');
                console.log(avatars);
                socket.emit('Get All Users Avatar Information Response', avatars);
            }
        });

        socket.on('Change Avatar', async (newAvatar: string) => {
            socket.emit('Avatar Change Response', await this.profileService.changeAvatar(this.accountInfoService.getUserId(socket), newAvatar));
        });

        socket.on('Change Language', async (newLanguage: string) => {
            socket.emit(
                'Language Change Response',
                await this.profileService.changeUserSettings(this.accountInfoService.getUserId(socket), newLanguage, false, true),
            );
        });

        socket.on('Change Theme', async (newTheme: string) => {
            socket.emit(
                'Theme Change Response',
                await this.profileService.changeUserSettings(this.accountInfoService.getUserId(socket), newTheme, true),
            );
        });

        socket.on('Change Language', async (newLanguage: string) => {
            socket.emit(
                'Language Change Response',
                await this.profileService.changeUserSettings(this.accountInfoService.getUserId(socket), newLanguage, false, true),
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
        /*
        socket.on('Get All Avatars', async () => {
            const listNameAllAvatars: string[] = ['cat', 'dog', 'flower'];
            const listAvatars: string[] = [];
            listNameAllAvatars.forEach((value, index) => {
                const contents = fs.readFileSync('./assets/avatar/' + listNameAllAvatars[index] + '.jpg', { encoding: 'base64' });
                listAvatars.push(contents);
            });
            socket.emit('Get All Avatars Response', listAvatars);
        });*/
    }
}
