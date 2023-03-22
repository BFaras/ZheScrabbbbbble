import { DATABASE_UNAVAILABLE } from '@app/constants/error-code-constants';
import {
    DEFAULT_LANGUAGE,
    DEFAULT_LEVEL,
    DEFAULT_THEME,
    DEFAULT_XP,
    GAMES_NB_STAT_NAME,
    GAME_TIME_AVRG_STAT_NAME,
    POINTS_AVRG_STAT_NAME,
    WINS_NB_STAT_NAME
} from '@app/constants/profile-constants';
import { ConnectivityStatus, UserStatus } from '@app/interfaces/friend-info';
import {
    ConnectionInfo,
    ConnectionType,
    GameHistoryInfo,
    LevelInfo,
    ProfileInfo,
    ProfileSettings,
    StatisticInfo
} from '@app/interfaces/profile-info';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';
import { FriendService } from './friend.service';
import { TimeFormatterService } from './time-formatter.service';
import { UserLevelService } from './user-level.service';
import { UsersStatusService } from './users-status.service';

@Service()
export class ProfileService {
    private readonly dbService: DatabaseService;
    private readonly friendService: FriendService;
    private readonly timeFormatterService: TimeFormatterService;
    private readonly usersStatusService: UsersStatusService;
    private readonly userLevelService: UserLevelService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
        this.friendService = Container.get(FriendService);
        this.timeFormatterService = Container.get(TimeFormatterService);
        this.usersStatusService = Container.get(UsersStatusService);
        this.userLevelService = Container.get(UserLevelService);

        this.usersStatusService.getStatusUpdater().subscribe({
            next: this.updateProfileFromNewStatus.bind(this),
        });
    }

    getDefaultProfileInformation(): ProfileInfo {
        return {
            avatar: '#000000',
            levelInfo: {
                level: DEFAULT_LEVEL,
                xp: DEFAULT_XP,
                nextLevelXp: this.userLevelService.getNextLevelXP(DEFAULT_LEVEL),
            },
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

    async getUserLevelInfo(userId: string): Promise<LevelInfo> {
        const username = await this.dbService.getUsernameFromId(userId);
        return (await this.getProfileInformation(username)).levelInfo;
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

    async updateUserStatsAndLevel(userId: string, newUserStats: StatisticInfo[], newLevelInfo: LevelInfo): Promise<string> {
        const profileInfo: ProfileInfo = await this.dbService.getUserProfileInfo(userId);
        let errorCode = DATABASE_UNAVAILABLE;

        profileInfo.stats = newUserStats;
        profileInfo.levelInfo = newLevelInfo;
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

    async addGameToHistory(userId: string, gameInfo: GameHistoryInfo): Promise<string> {
        const profileInfo: ProfileInfo = await this.dbService.getUserProfileInfo(userId);
        let errorCode: string = DATABASE_UNAVAILABLE;

        if (profileInfo !== this.getDefaultProfileInformation()) {
            profileInfo.gameHistory.push(gameInfo);
            errorCode = await this.dbService.changeUserProfileInfo(userId, profileInfo);
        }
        return errorCode;
    }

    private async updateProfileFromNewStatus(userSatus: UserStatus) {
        if (userSatus.status === ConnectivityStatus.ONLINE) {
            await this.addConnection(userSatus.userId, this.generateConnectionInfo(ConnectionType.CONNECTION));
        } else if (userSatus.status === ConnectivityStatus.OFFLINE) {
            await this.addConnection(userSatus.userId, this.generateConnectionInfo(ConnectionType.DISCONNECTION));
        }
    }

    private generateConnectionInfo(conectionType: ConnectionType): ConnectionInfo {
        return {
            connectionType: conectionType,
            date: this.timeFormatterService.getDateString(),
            time: this.timeFormatterService.getTimeStampString(),
        };
    }
}
