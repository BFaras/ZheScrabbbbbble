import { DATABASE_UNAVAILABLE, NO_ERROR } from '@app/constants/error-code-constants';
import { ProfileInfo, ProfileSettings } from '@app/interfaces/profile-info';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class ProfileService {
    private readonly dbService: DatabaseService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
    }

    getDefaultProfileInformation(): ProfileInfo {
        return {
            avatar: '',
            level: 0,
            userCode: '',
            stats: [], // Add the different stats that we need later
            tournamentWins: [0, 0, 0],
            connectionHistory: [],
            gameHistory: [],
        };
    }

    getDefaultProfileSettings(): ProfileSettings {
        return {
            theme: 'Default',
            language: 'fr',
        };
    }

    async getProfileInformation(username: string): Promise<ProfileInfo> {
        const userId: string = await this.dbService.getUserId(username);
        return await this.dbService.getUserProfileInfo(userId);
    }

    async getUserSettings(userId: string): Promise<ProfileSettings> {
        return this.dbService.getUserProfileSettings(userId);
    }

    async createNewProfile(username: string, avatar: string): Promise<boolean> {
        const userId: string = await this.dbService.getUserId(username);
        const profileInfo: ProfileInfo = this.getDefaultProfileInformation();
        profileInfo.avatar = avatar;
        return await this.dbService.addNewProfile(userId, profileInfo, this.getDefaultProfileSettings());
    }

    async changeAvatar(userId: string, newAvatar: string) {
        const profileInfo: ProfileInfo = await this.dbService.getUserProfileInfo(userId);
        let errorCode: string = DATABASE_UNAVAILABLE;

        if (profileInfo !== this.getDefaultProfileInformation()) {
            profileInfo.avatar = newAvatar;
            if (await this.dbService.changeUserProfileInfo(userId, profileInfo)) {
                errorCode = NO_ERROR;
            }
        }
        return errorCode;
    }

    async changeUserSettings(userId: string, newSetting: string, isChangeTheme: boolean, isChangeLanguage?: boolean): Promise<string> {
        const profileSettings: ProfileSettings = await this.dbService.getUserProfileSettings(userId);
        let errorCode: string = DATABASE_UNAVAILABLE;

        if (isChangeTheme) {
            profileSettings.theme = newSetting;
        } else if (isChangeLanguage) {
            profileSettings.language = newSetting;
        }

        if (await this.dbService.changeUserProfileSettings(userId, profileSettings)) {
            errorCode = NO_ERROR;
        }
        return errorCode;
    }
}
