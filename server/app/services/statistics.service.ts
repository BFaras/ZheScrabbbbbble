/* eslint-disable @typescript-eslint/prefer-for-of */
import { DATABASE_UNAVAILABLE } from '@app/constants/error-code-constants';
import { GAMES_NB_STAT_NAME, GAME_TIME_AVRG_STAT_NAME, POINTS_AVRG_STAT_NAME, WINS_NB_STAT_NAME } from '@app/constants/profile-constants';
import { GameHistoryInfo, LevelInfo, StatisticInfo } from '@app/interfaces/profile-info';
import { Container, Service } from 'typedi';
import { ProfileService } from './profile.service';
import { TimeFormatterService } from './time-formatter.service';
import { UserLevelService } from './user-level.service';

@Service()
export class StatisticService {
    private readonly profileService: ProfileService;
    private readonly userLevelService: UserLevelService;
    private readonly timeFormatterService: TimeFormatterService;

    constructor() {
        this.profileService = Container.get(ProfileService);
        this.userLevelService = Container.get(UserLevelService);
        this.timeFormatterService = Container.get(TimeFormatterService);
    }

    async addGameStats(userId: string, isWin: boolean, gamePointsObtained: number, gameTime: number) {
        const userLevelInfo: LevelInfo = await this.profileService.getUserLevelInfo(userId);
        const newUserLevelInfo = this.userLevelService.calculateNewLevelInfo(userLevelInfo, isWin, gamePointsObtained);
        let userStats: StatisticInfo[] = await this.profileService.getUserStats(userId);
        let errorCode = DATABASE_UNAVAILABLE;

        if (isWin) {
            userStats = this.incrementStat(userStats, WINS_NB_STAT_NAME);
        }

        userStats = this.changeStatAverage(userStats, POINTS_AVRG_STAT_NAME, gamePointsObtained);
        userStats = this.changeStatAverage(userStats, GAME_TIME_AVRG_STAT_NAME, gameTime);
        userStats = this.incrementStat(userStats, GAMES_NB_STAT_NAME);

        errorCode = await this.profileService.updateUserStatsAndLevel(userId, userStats, newUserLevelInfo);
        errorCode = await this.profileService.addGameToHistory(userId, this.generateGameInfo(isWin));
        return errorCode;
    }

    private incrementStat(userStats: StatisticInfo[], statName: string): StatisticInfo[] {
        const statPos = this.getStatPosition(userStats, statName);
        userStats[statPos].statAmount++;
        return userStats;
    }

    private changeStatAverage(userStats: StatisticInfo[], statName: string, amountToAdd: number): StatisticInfo[] {
        const nbOfGames = userStats[this.getStatPosition(userStats, GAMES_NB_STAT_NAME)].statAmount;
        const statPos = this.getStatPosition(userStats, statName);
        const oldStatAmount = userStats[statPos].statAmount;

        userStats[statPos].statAmount = this.calculateNewAverage(oldStatAmount, amountToAdd, nbOfGames);

        return userStats;
    }

    private getStatPosition(userStats: StatisticInfo[], statName: string): number {
        let statPos = 10;
        for (let i = 0; i < userStats.length; i++) {
            if (userStats[i].name === statName) {
                statPos = i;
                break;
            }
        }

        return statPos;
    }

    private calculateNewAverage(oldAverage: number, amountToAdd: number, oldTotalNbOfStats: number): number {
        return (oldAverage * oldTotalNbOfStats + amountToAdd) / (oldTotalNbOfStats + 1);
    }

    private generateGameInfo(isWin: boolean): GameHistoryInfo {
        return {
            date: this.timeFormatterService.getDateString(),
            time: this.timeFormatterService.getTimeStampString(),
            isWinner: isWin,
        };
    }
}
