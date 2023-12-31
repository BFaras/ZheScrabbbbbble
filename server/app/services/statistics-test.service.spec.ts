/* eslint-disable dot-notation */
/* eslint-disable max-len */
import { NO_ERROR } from '@app/constants/error-code-constants';
import { GAMES_NB_STAT_NAME, GAME_TIME_AVRG_STAT_NAME, POINTS_AVRG_STAT_NAME, WINS_NB_STAT_NAME } from '@app/constants/profile-constants';
import { StatisticInfo } from '@app/interfaces/profile-info';
import { Question } from '@app/interfaces/question';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Container } from 'typedi';
import { AuthentificationService } from './authentification.service';
import { DatabaseService } from './database.service';
import { ProfileService } from './profile.service';
import { StatisticService } from './statistics.service';

describe('Statistics Tests', async () => {
    const testUsername = 'testUser157Test';
    const testPassword = 'tE!s&to~';
    const testEmail = 'myTestMail12564@poly.com';
    const testAvatar = 'av111';
    const testSecurityQuestion: Question = { question: 'Who are you?', answer: 'Me' };

    let mongoServer: MongoMemoryServer;
    let dbService: DatabaseService;
    let authService: AuthentificationService;
    let profileService: ProfileService;
    let statsService: StatisticService;
    let accountCreated = false;

    before(async () => {
        dbService = Container.get(DatabaseService);
        mongoServer = new MongoMemoryServer();
        await dbService.start(await mongoServer.getUri());
    });

    beforeEach(async () => {
        authService = Container.get(AuthentificationService);
        profileService = Container.get(ProfileService);
        statsService = Container.get(StatisticService);
        const accountCreationError = await authService.createAccount(testUsername, testPassword, testEmail, testAvatar, testSecurityQuestion);
        accountCreated = accountCreationError === NO_ERROR;
    });

    afterEach(async () => {
        if (accountCreated) {
            await dbService.removeUserAccount(testUsername);
            accountCreated = false;
        }
    });

    after(async () => {
        if (dbService['client']) {
            await dbService['client'].close();
        }
    });

    it('should update the game stats when we add them for the first time with updateGameStats()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const testIsWin = true;
        const testPointsObtained = 105;
        const testGameTime = 1005;
        const expectedNbOfWins = 1;
        const expectedNbOfGamesPlayed = 1;
        const expectedPointsAvrg = 105;
        const expectedTimeAvrg = 1005;

        await statsService.addGameStats(userId, testIsWin, testPointsObtained, testGameTime);

        const profileStats: StatisticInfo[] = await profileService.getUserStats(userId);
        expect(profileStats[statsService['getStatPosition'](profileStats, WINS_NB_STAT_NAME)].statAmount).to.equal(expectedNbOfWins);
        expect(profileStats[statsService['getStatPosition'](profileStats, GAMES_NB_STAT_NAME)].statAmount).to.equal(expectedNbOfGamesPlayed);
        expect(profileStats[statsService['getStatPosition'](profileStats, POINTS_AVRG_STAT_NAME)].statAmount).to.equal(expectedPointsAvrg);
        expect(profileStats[statsService['getStatPosition'](profileStats, GAME_TIME_AVRG_STAT_NAME)].statAmount).to.equal(expectedTimeAvrg);
    });

    it('should calculate the game stats correctly when we add them for different games with updateGameStats()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const nbOfGamesPlayed = 8;
        const testBasePointsObtained = 105;
        const testBaseGameTime = 1005;

        let pointsAccumulated = 0;
        let gameTimeAccumulated = 0;
        let nbOfWinsNbOfWinsAccumulated = 0;

        for (let i = 0; i < nbOfGamesPlayed; i++) {
            const isWin = i % 2 === 0;
            await statsService.addGameStats(userId, isWin, testBasePointsObtained + i, testBaseGameTime + i);

            if (isWin) {
                nbOfWinsNbOfWinsAccumulated++;
            }
            pointsAccumulated += testBasePointsObtained + i;
            gameTimeAccumulated += testBaseGameTime + i;
        }

        const profileStats: StatisticInfo[] = await profileService.getUserStats(userId);
        const expectedPointsAvrg = pointsAccumulated / nbOfGamesPlayed;
        const expectedTimeAvrg = gameTimeAccumulated / nbOfGamesPlayed;
        expect(profileStats[statsService['getStatPosition'](profileStats, WINS_NB_STAT_NAME)].statAmount).to.equal(nbOfWinsNbOfWinsAccumulated);
        expect(profileStats[statsService['getStatPosition'](profileStats, GAMES_NB_STAT_NAME)].statAmount).to.equal(nbOfGamesPlayed);
        expect(profileStats[statsService['getStatPosition'](profileStats, POINTS_AVRG_STAT_NAME)].statAmount).to.equal(expectedPointsAvrg);
        expect(profileStats[statsService['getStatPosition'](profileStats, GAME_TIME_AVRG_STAT_NAME)].statAmount).to.equal(expectedTimeAvrg);
    });
});
