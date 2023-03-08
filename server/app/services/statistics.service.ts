/* eslint-disable @typescript-eslint/prefer-for-of */
import { DATABASE_UNAVAILABLE } from '@app/constants/error-code-constants';
import { WINS_NB_STAT_NAME } from '@app/constants/profile-constants';
import { StatisticInfo } from '@app/interfaces/profile-info';
import { Container, Service } from 'typedi';
import { ProfileService } from './profile.service';

@Service()
export class StatisticService {
    private readonly profileService: ProfileService;

    constructor() {
        this.profileService = Container.get(ProfileService);
    }

    async incrementWins(userId: string): Promise<string> {
        const userStats: StatisticInfo[] = await this.profileService.getUserStats(userId);
        let errorCode = DATABASE_UNAVAILABLE;

        for (let i = 0; i < userStats.length; i++) {
            if (userStats[i].name === WINS_NB_STAT_NAME) {
                userStats[i].statAmount++;
            }
        }

        errorCode = await this.profileService.updateUserStats(userId, userStats);
        return errorCode;
    }
}
