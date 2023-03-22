import * as io from 'socket.io';
import { Container, Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { ProfileService } from './profile.service';
const fs = require('fs');
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

        socket.on('Change Language', async (newLanguage: string) => {
            socket.emit(
                'Language Change Response',
                await this.profileService.changeUserSettings(this.accountInfoService.getUserId(socket), newLanguage, false, true),
            );
        });

        socket.on('Get All Avatars', async () => {
            const listNameAllAvatars: string[] = ['cat','dog','flower'];
            const listAvatars: string[] = [];
            listNameAllAvatars.forEach((value, index) => {
                const contents = fs.readFileSync('./assets/avatar/' + listNameAllAvatars[index] + '.jpg', { encoding: 'base64' });
                listAvatars.push(contents);
            })
            socket.emit('Get All Avatars Response', listAvatars);
        });
    }
}
