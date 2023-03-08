import { DATABASE_UNAVAILABLE, NO_ERROR } from '@app/constants/error-code-constants';
import {
    DEFAULT_LANGUAGE,
    DEFAULT_THEME,
    GAMES_NB_STAT_NAME,
    GAME_TIME_AVRG_STAT_NAME,
    POINTS_AVRG_STAT_NAME,
    WINS_NB_STAT_NAME
} from '@app/constants/profile-constants';
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
            stats: [
                { name: WINS_NB_STAT_NAME, statAmount: 0 },
                { name: GAMES_NB_STAT_NAME, statAmount: 0 },
                { name: POINTS_AVRG_STAT_NAME, statAmount: 0 },
                { name: GAME_TIME_AVRG_STAT_NAME, statAmount: 0 },
            ],
            tournamentWins: [0, 0, 0],
            connectionHistory: [],
            gameHistory: [],
        };
    }

    getDefaultProfileSettings(): ProfileSettings {
        return {
            theme: DEFAULT_THEME,
            language: DEFAULT_LANGUAGE,
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
