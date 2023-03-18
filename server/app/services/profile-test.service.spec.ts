/* eslint-disable dot-notation */
/* eslint-disable max-len */
import { NO_ERROR } from '@app/constants/error-code-constants';
import { ConnectionInfo, ConnectionType, GameInfo, PlayerGameInfo } from '@app/interfaces/profile-info';
import { Question } from '@app/interfaces/question';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Container } from 'typedi';
import { AuthentificationService } from './authentification.service';
import { DatabaseService } from './database.service';
import { FriendService } from './friend.service';
import { ProfileService } from './profile.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');

describe('Profile Tests', async () => {
    const testUsername = 'testUser157Test';
    const testPassword = 'tE!s&to~';
    const testEmail = 'myTestMail12564@poly.com';
    const testAvatar = 'av111';
    const testFriendCode = 'friendsasdguyw45448d';
    const testSecurityQuestion: Question = { question: 'Who are you?', answer: 'Me' };

    let mongoServer: MongoMemoryServer;
    let dbService: DatabaseService;
    let authService: AuthentificationService;
    let profileService: ProfileService;
    let accountCreated = false;

    before(async () => {
        dbService = Container.get(DatabaseService);
        mongoServer = new MongoMemoryServer();
        await dbService.start(await mongoServer.getUri());

        Sinon.stub(FriendService.prototype, 'generateUniqueFriendCode').returns(Promise.resolve(testFriendCode));
    });

    beforeEach(async () => {
        authService = Container.get(AuthentificationService);
        profileService = Container.get(ProfileService);

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
        Sinon.restore();
    });

    it('should create profile info on account creation', async () => {
        const defaultProfileInfo = profileService.getDefaultProfileInformation();

        expect(await profileService.getProfileInformation(testUsername)).to.not.deep.equals(defaultProfileInfo);
    });

    it('should have the correct profile info on account creation', async () => {
        const expectedProfileInfo = profileService.getDefaultProfileInformation();

        expectedProfileInfo.avatar = testAvatar;
        expectedProfileInfo.userCode = testFriendCode;

        expect(await profileService.getProfileInformation(testUsername)).to.deep.equals(expectedProfileInfo);
    });

    it('should change the user avatar and have the correct avatar in the DB on changeAvatar()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const testAvatar2 = 'av222';

        await profileService.changeAvatar(userId, testAvatar2);

        expect((await profileService.getProfileInformation(testUsername)).avatar).to.deep.equals(testAvatar2);
    });

    it('should get the right user stats on getUserStats()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const expectedUserStats = profileService.getDefaultProfileInformation().stats;

        expect(await profileService.getUserStats(userId)).to.deep.equals(expectedUserStats);
    });

    it('should get the right user setting on getUserSettings()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const expectedUserSettings = profileService.getDefaultProfileSettings();

        expect(await profileService.getUserSettings(userId)).to.deep.equals(expectedUserSettings);
    });

    it('should change the user language to the right value on changeUserSettings()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const newTestLanguage = 'en';

        await profileService.changeUserSettings(userId, newTestLanguage, false, true);

        expect(await (await profileService.getUserSettings(userId)).language).to.deep.equals(newTestLanguage);
    });

    it('should change the user theme to the right value on changeUserSettings()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const newTestTheme = 'Theme2';

        await profileService.changeUserSettings(userId, newTestTheme, true);

        expect(await (await profileService.getUserSettings(userId)).theme).to.deep.equals(newTestTheme);
    });

    it('should change the userStats to the right value on updateUserStats()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const newTestUserStats = profileService.getDefaultProfileInformation().stats;

        newTestUserStats[0].statAmount = 3;
        newTestUserStats[2].statAmount = 102;
        await profileService.updateUserStats(userId, newTestUserStats);

        expect(await profileService.getUserStats(userId)).to.deep.equals(newTestUserStats);
    });

    it('should add a connection to the history on addConnection()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const newConnectionTest: ConnectionInfo = {
            connectionType: ConnectionType.CONNECTION,
            date: 'MM/DD/YYYY',
            time: 'HH:MM',
        };

        const newDisconnectionTest: ConnectionInfo = {
            connectionType: ConnectionType.DISCONNECTION,
            date: 'MM/DD/YYYY',
            time: 'HH:MM',
        };

        await profileService.addConnection(userId, newConnectionTest);
        await profileService.addConnection(userId, newDisconnectionTest);

        const testConnectionHistory = (await profileService.getProfileInformation(testUsername)).connectionHistory;
        expect(testConnectionHistory[0]).to.deep.equal(newConnectionTest);
        expect(testConnectionHistory[1]).to.deep.equal(newDisconnectionTest);
    });

    it('should add a tournament victory to the rightful position to the profile on addTournamentVictory()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const testTournamentPos = 2;
        const nbOfVictoriesExpected = 4;

        for (let i = 0; i < nbOfVictoriesExpected; i++) {
            await profileService.addTournamentWin(userId, testTournamentPos);
        }

        expect((await profileService.getProfileInformation(testUsername)).tournamentWins[testTournamentPos - 1]).to.equal(nbOfVictoriesExpected);
    });

    it('should add a game to the history on addGameToHistory()', async () => {
        const userId = await dbService.getUserId(testUsername);
        const playersInGameInfo: PlayerGameInfo[] = [
            {
                name: 'Hello',
                score: 105,
            },
            {
                name: 'Problem',
                score: 81,
            },
        ];
        const newGameToAdd: GameInfo = {
            date: 'MM/DD/YYYY',
            time: 'HH:MM',
            length: '15:25',
            winnerIndex: 1,
            players: playersInGameInfo,
            gameMode: 'Classic',
        };

        await profileService.addGameToHistory(userId, newGameToAdd);
        await profileService.addGameToHistory(userId, newGameToAdd);

        const testGameHistory = (await profileService.getProfileInformation(testUsername)).gameHistory;
        expect(testGameHistory[0]).to.deep.equal(newGameToAdd);
        expect(testGameHistory[1]).to.deep.equal(newGameToAdd);
    });
});
