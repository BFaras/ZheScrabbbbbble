import { DATABASE_UNAVAILABLE, INVALID_DATA_SENT, NO_ERROR } from '@app/constants/error-code-constants';
import { DEFAULT_LANGUAGE, DEFAULT_THEME } from '@app/constants/profile-constants';
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
        /* Ajouter tous les avatars à enlever quand on pourra envoyer les avatars */
        socket.on('Get All Users Avatar Information', async (usernames: string[]) => {
            const avatars: string[] = [];
            if (usernames !== null && usernames !== undefined) {
                for (const username of usernames) {
                    if (username) {
                        avatars.push((await this.profileService.getProfileInformation(username)).avatar);
                    } else {
                        socket.emit('Get All Users Avatar Information Response', DATABASE_UNAVAILABLE);
                    }
                }
                socket.emit('Get All Users Avatar Information Response', avatars);
            }
        });

        socket.on('Get Avatar from Username', async (username: string) => {
            // for light client
            if (username) {
                const avatar = (await this.profileService.getProfileInformation(username)).avatar;
                socket.emit('Avatar from Username Response', avatar);
            }
        });

        socket.on('Get Avatars from Usernames', async (usernames: string[]) => {
            // for light client
            const avatarsUsername = {};
            for (const username of usernames) {
                if (username !== '' && username !== undefined && username !== null) {
                    const avatar = (await this.profileService.getProfileInformation(username)).avatar;
                    avatarsUsername[username] = avatar;
                }
            }
            socket.emit('Avatars from Usernames Response', avatarsUsername);
        });

        socket.on('Change Avatar', async (newAvatar: string) => {
            const userId = this.accountInfoService.getUserId(socket);
            if (newAvatar && userId) {
                socket.emit('Avatar Change Response', await this.profileService.changeAvatar(userId, newAvatar));
            } else {
                socket.emit('Avatar Change Response', INVALID_DATA_SENT);
            }
        });

        socket.on('Change Language', async (newLanguage: string) => {
            const userId = this.accountInfoService.getUserId(socket);
            if (newLanguage && userId) {
                socket.emit('Language Change Response', await this.profileService.changeUserSettings(userId, newLanguage, false, true));
            } else {
                socket.emit('Language Change Response', INVALID_DATA_SENT);
            }
        });

        socket.on('Change Theme', async (newTheme: string) => {
            const userId = this.accountInfoService.getUserId(socket);
            if (newTheme && userId) {
                socket.emit('Theme Change Response', await this.profileService.changeUserSettings(userId, newTheme, true));
            } else {
                socket.emit('Theme Change Response', INVALID_DATA_SENT);
            }
        });

        socket.on('Change Language', async (newLanguage: string) => {
            const userId = this.accountInfoService.getUserId(socket);
            if (newLanguage && userId) {
                socket.emit('Language Change Response', await this.profileService.changeUserSettings(userId, newLanguage, false, true));
            } else {
                socket.emit('Language Change Response', INVALID_DATA_SENT);
            }
        });

        socket.on('Change Username', async (newUsername: string) => {
            const oldUsername = this.accountInfoService.getUsername(socket);
            const userId = this.accountInfoService.getUserId(socket);
            let usernameChangeError = INVALID_DATA_SENT;
            if (newUsername && oldUsername && userId) {
                usernameChangeError = await this.profileService.changeUsername(userId, newUsername);

                if (usernameChangeError === NO_ERROR) {
                    this.accountInfoService.setUsername(socket, newUsername);
                    this.friendSocketService.updateFriendsWithNewUsername(oldUsername, newUsername, userId);
                }
            }
            socket.emit('Username Change Response', usernameChangeError);
        });

        socket.on('Get Theme and Language', async () => {
            const userId = this.accountInfoService.getUserId(socket);
            if (userId) {
                const userSettings = await this.profileService.getUserSettings(userId);
                socket.emit('Theme and Language Response', userSettings.theme, userSettings.language);
            } else {
                socket.emit('Theme and Language Response', DEFAULT_THEME, DEFAULT_LANGUAGE);
            }
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
