import { DATABASE_UNAVAILABLE } from '@app/constants/error-code-constants';
import {
    DEFAULT_LANGUAGE,
    DEFAULT_THEME,
    GAMES_NB_STAT_NAME,
    GAME_TIME_AVRG_STAT_NAME,
    POINTS_AVRG_STAT_NAME,
    WINS_NB_STAT_NAME
} from '@app/constants/profile-constants';
import { ConnectionInfo, GameInfo, ProfileInfo, ProfileSettings, StatisticInfo } from '@app/interfaces/profile-info';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';
import { FriendService } from './friend.service';

@Service()
export class ProfileService {
    private readonly dbService: DatabaseService;
    private readonly friendService: FriendService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
        this.friendService = Container.get(FriendService);
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

    async getUserStats(userId: string): Promise<StatisticInfo[]> {
        const username: string = await this.dbService.getUsernameFromId(userId);
        return (await this.getProfileInformation(username)).stats;
    }

    async getUserSettings(userId: string): Promise<ProfileSettings> {
        return this.dbService.getUserProfileSettings(userId);
    }

    async createNewProfile(userId: string, avatar: string): Promise<boolean> {
        const profileInfo: ProfileInfo = this.getDefaultProfileInformation();

        profileInfo.avatar = avatar;
        profileInfo.userCode = await this.friendService.generateUniqueFriendCode();
        return await this.dbService.addNewProfile(userId, profileInfo, this.getDefaultProfileSettings());
    }

    async changeAvatar(userId: string, newAvatar: string) {
        const profileInfo: ProfileInfo = await this.dbService.getUserProfileInfo(userId);
        let errorCode: string = DATABASE_UNAVAILABLE;

        if (profileInfo !== this.getDefaultProfileInformation()) {
            profileInfo.avatar = newAvatar;
            errorCode = await this.dbService.changeUserProfileInfo(userId, profileInfo);
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

        errorCode = await this.dbService.changeUserProfileSettings(userId, profileSettings);
        return errorCode;
    }

    async updateUserStats(userId: string, newUserStats: StatisticInfo[]): Promise<string> {
        const profileInfo: ProfileInfo = await this.dbService.getUserProfileInfo(userId);
        let errorCode = DATABASE_UNAVAILABLE;

        profileInfo.stats = newUserStats;
        errorCode = await this.dbService.changeUserProfileInfo(userId, profileInfo);

        return errorCode;
    }

    async addConnection(userId: string, connectionInfo: ConnectionInfo): Promise<string> {
        const profileInfo: ProfileInfo = await this.dbService.getUserProfileInfo(userId);
        let errorCode: string = DATABASE_UNAVAILABLE;

        if (profileInfo !== this.getDefaultProfileInformation()) {
            profileInfo.connectionHistory.push(connectionInfo);
            errorCode = await this.dbService.changeUserProfileInfo(userId, profileInfo);
        }
        return errorCode;
    }

    async addTournamentWin(userId: string, tournamentPosition: number) {
        const profileInfo: ProfileInfo = await this.dbService.getUserProfileInfo(userId);
        let errorCode: string = DATABASE_UNAVAILABLE;

        if (profileInfo !== this.getDefaultProfileInformation()) {
            profileInfo.tournamentWins[tournamentPosition - 1]++;
            errorCode = await this.dbService.changeUserProfileInfo(userId, profileInfo);
        }
        return errorCode;
    }

    async addGameToHistory(userId: string, gameInfo: GameInfo): Promise<string> {
        const profileInfo: ProfileInfo = await this.dbService.getUserProfileInfo(userId);
        let errorCode: string = DATABASE_UNAVAILABLE;

        if (profileInfo !== this.getDefaultProfileInformation()) {
            profileInfo.gameHistory.push(gameInfo);
            errorCode = await this.dbService.changeUserProfileInfo(userId, profileInfo);
        }
        return errorCode;
    }
}
