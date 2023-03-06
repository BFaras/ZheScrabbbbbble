import { DATABASE_UNAVAILABLE, NO_ERROR } from '@app/constants/error-code-constants';
import { ProfileInfo } from '@app/interfaces/profile-info';
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

    async getProfileInformation(username: string): Promise<ProfileInfo> {
        const userId: string = await this.dbService.getUserId(username);
        return await this.dbService.getUserProfileInfo(userId);
    }

    async createNewProfile(username: string, avatar: string): Promise<boolean> {
        const userId: string = await this.dbService.getUserId(username);
        const profileInfo: ProfileInfo = this.getDefaultProfileInformation();
        profileInfo.avatar = avatar;
        return await this.dbService.addNewProfile(userId, profileInfo);
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
}
