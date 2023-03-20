import {
    BASE_XP,
    MULTIPLICATIVE_FACTOR as MULTIPLICATIVE_XP_FACTOR,
    XP_AMOUNT_FOR_GAME_POINTS,
    XP_AMOUNT_FOR_VICTORY
} from '@app/constants/level-constants';
import { LevelInfo } from '@app/interfaces/profile-info';
import { Service } from 'typedi';

@Service()
export class UserLevelService {
    calculateNewLevelInfo(levelInfo: LevelInfo, isWin: boolean, nbOfGamePoints: number): LevelInfo {
        let nextLevelXp: number = this.getNextLevelXP(levelInfo.level);
        let newAmountOfXp: number = levelInfo.xp + nbOfGamePoints * XP_AMOUNT_FOR_GAME_POINTS;

        if (isWin) {
            newAmountOfXp += XP_AMOUNT_FOR_VICTORY;
        }

        while (newAmountOfXp >= nextLevelXp) {
            levelInfo.level++;
            newAmountOfXp -= nextLevelXp;
            nextLevelXp = this.getNextLevelXP(levelInfo.level);
        }

        levelInfo.xp = newAmountOfXp;
        levelInfo.nextLevelXp = nextLevelXp;

        return levelInfo;
    }

    getNextLevelXP(currentLevel: number): number {
        return Math.floor((currentLevel * MULTIPLICATIVE_XP_FACTOR) / 2) + BASE_XP;
    }
}
