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
    const testAvatar = '1238894';
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
        const accountCreationError = await authService.createAccount(testUsername, testPassword, testEmail, testAvatar, testSecurityQuestion);
        const defaultProfileInfo = profileService.getDefaultProfileInformation();
        accountCreated = accountCreationError === NO_ERROR;

        expect(await profileService.getProfileInformation(testUsername)).to.not.deep.equals(defaultProfileInfo);
    });

    it('should have the correct profile info on account creation', async () => {
        const accountCreationError = await authService.createAccount(testUsername, testPassword, testEmail, testAvatar, testSecurityQuestion);
        const expectedProfileInfo = profileService.getDefaultProfileInformation();

        expectedProfileInfo.avatar = testAvatar;
        accountCreated = accountCreationError === NO_ERROR;

        expect(await profileService.getProfileInformation(testUsername)).to.deep.equals(expectedProfileInfo);
    });
});