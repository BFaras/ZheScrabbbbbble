/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { NO_ERROR } from '@app/constants/error-code-constants';
import { Question } from '@app/interfaces/question';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Container } from 'typedi';
import { AuthentificationService } from './authentification.service';
import { DatabaseService } from './database.service';
import { ProfileService } from './profile.service';

describe('Profile Tests', async () => {
    const testUsername = 'testUser157Test';
    const testPassword = 'tE!s&to~';
    const testEmail = 'myTestMail12564@poly.com';
    const testAvatar = 'av111';
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
    });

    it('should create profile info on account creation', async () => {
        const defaultProfileInfo = profileService.getDefaultProfileInformation();

        expect(await profileService.getProfileInformation(testUsername)).to.not.deep.equals(defaultProfileInfo);
    });

    it('should have the correct profile info on account creation', async () => {
        const expectedProfileInfo = profileService.getDefaultProfileInformation();

        expectedProfileInfo.avatar = testAvatar;

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
});
