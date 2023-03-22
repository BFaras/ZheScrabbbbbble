/* eslint-disable dot-notation */
/* eslint-disable max-len */
import { LevelInfo } from '@app/interfaces/profile-info';
import { expect } from 'chai';
import { Container } from 'typedi';
import { UserLevelService } from './user-level.service';

describe('Level tests', async () => {
    let levelService: UserLevelService;

    beforeEach(async () => {
        levelService = Container.get(UserLevelService);
    });

    it('should return the right number of XP when getNextLevelXP()', async () => {
        const testLevel1 = 0;
        const testLevel2 = 4;
        const testLevel3 = 7;
        const expectedXP1 = 100;
        const expectedXP2 = 200;
        const expectedXP3 = 275;

        expect(levelService.getNextLevelXP(testLevel1)).to.equal(expectedXP1);
        expect(levelService.getNextLevelXP(testLevel2)).to.equal(expectedXP2);
        expect(levelService.getNextLevelXP(testLevel3)).to.equal(expectedXP3);
    });

    it('should pass you to the next level if you have just enough XP for it', async () => {
        const testLevel = 2;
        const amountOfXP = levelService.getNextLevelXP(testLevel);
        const amountOfXPExpected = 0;
        const expectedLevel = testLevel + 1;
        const testLevelInfo: LevelInfo = {
            level: testLevel,
            xp: amountOfXP,
            nextLevelXp: levelService.getNextLevelXP(testLevel),
        };

        expect(levelService.calculateNewLevelInfo(testLevelInfo, false, 0).level).to.equal(expectedLevel);
        expect(levelService.calculateNewLevelInfo(testLevelInfo, false, 0).xp).to.equal(amountOfXPExpected);
    });

    it('should pass you to the next level if you have the amount of XP required + 1 for it', async () => {
        const testLevel = 2;
        const amountOfXP = levelService.getNextLevelXP(testLevel) + 1;
        const amountOfXPExpected = 1;
        const expectedLevel = testLevel + 1;
        const testLevelInfo: LevelInfo = {
            level: testLevel,
            xp: amountOfXP,
            nextLevelXp: levelService.getNextLevelXP(testLevel),
        };

        expect(levelService.calculateNewLevelInfo(testLevelInfo, false, 0).level).to.equal(expectedLevel);
        expect(levelService.calculateNewLevelInfo(testLevelInfo, false, 0).xp).to.equal(amountOfXPExpected);
    });

    it('should not pass you to the next level if you have the amount of XP required - 1 for it', async () => {
        const testLevel = 2;
        const amountOfXP = levelService.getNextLevelXP(testLevel) - 1;
        const amountOfXPExpected = amountOfXP;
        const expectedLevel = testLevel;
        const testLevelInfo: LevelInfo = {
            level: testLevel,
            xp: amountOfXP,
            nextLevelXp: levelService.getNextLevelXP(testLevel),
        };

        expect(levelService.calculateNewLevelInfo(testLevelInfo, false, 0).level).to.equal(expectedLevel);
        expect(levelService.calculateNewLevelInfo(testLevelInfo, false, 0).xp).to.equal(amountOfXPExpected);
    });

    it('should jump you two levels if you have the XP to pass two levels', async () => {
        const testLevel = 2;
        const amountOfXP = levelService.getNextLevelXP(testLevel) + levelService.getNextLevelXP(testLevel + 1);
        const amountOfXPExpected = 0;
        const expectedLevel = testLevel + 2;
        const testLevelInfo: LevelInfo = {
            level: testLevel,
            xp: amountOfXP,
            nextLevelXp: levelService.getNextLevelXP(testLevel),
        };

        expect(levelService.calculateNewLevelInfo(testLevelInfo, false, 0).level).to.equal(expectedLevel);
        expect(levelService.calculateNewLevelInfo(testLevelInfo, false, 0).xp).to.equal(amountOfXPExpected);
    });
});
