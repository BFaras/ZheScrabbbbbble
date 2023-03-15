/* eslint-disable dot-notation */
/* eslint-disable max-len */
import { NO_ERROR } from '@app/constants/error-code-constants';
import { Question } from '@app/interfaces/question';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Container } from 'typedi';
import { AuthentificationService } from './authentification.service';
import { DatabaseService } from './database.service';
import { FriendService } from './friend.service';
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
    let friendService: FriendService;
    let accountCreated = false;

    before(async () => {
        dbService = Container.get(DatabaseService);
        mongoServer = new MongoMemoryServer();
        await dbService.start(await mongoServer.getUri());
    });

    beforeEach(async () => {
        authService = Container.get(AuthentificationService);
        profileService = Container.get(ProfileService);
        friendService = Container.get(FriendService);

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

    it('should return true if the friend code already exists on isFriendCodeExistant()', async () => {
        const userFriendCode: string = (await profileService.getProfileInformation(testUsername)).userCode;
        expect(await friendService.isFriendCodeExistant(userFriendCode)).to.be.true;
    });

    it('should return false if the friend code doesnt exist on isFriendCodeExistant()', async () => {
        const randomInexsitantCode = 'DJS45sa';
        expect(await friendService.isFriendCodeExistant(randomInexsitantCode)).to.be.false;
    });
});
