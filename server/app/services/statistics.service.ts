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
        return this.updateStat(userId, WINS_NB_STAT_NAME, this.incrementStatAmount);
    }

    private async updateStat(userId: string, statName: string, changeStat: (userStat: StatisticInfo) => number): Promise<string> {
        const userStats: StatisticInfo[] = await this.profileService.getUserStats(userId);
        let errorCode = DATABASE_UNAVAILABLE;

        for (let i = 0; i < userStats.length; i++) {
            if (userStats[i].name === statName) {
                userStats[i].statAmount = changeStat(userStats[i]);
            }
        }

        errorCode = await this.profileService.updateUserStats(userId, userStats);
        return errorCode;
    }

    private incrementStatAmount(userStat: StatisticInfo): number {
        return userStat.statAmount++;
    }
}
