/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import {
    DATABASE_UNAVAILABLE,
    EMAIL_INVALID,
    NO_ERROR,
    PASSWORD_INVALID,
    USERNAME_INVALID,
    USERNAME_TAKEN
} from '@app/constants/error-code-constants';
import { Question } from '@app/interfaces/question';
import { expect } from 'chai';
import { assert } from 'console';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Container from 'typedi';
import { AuthentificationService } from './authentification.service';
import { DatabaseService } from './database.service';
import { UsersStatusService } from './users-status.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');

describe('AuthentificationService Tests', () => {
    const testUsername = 'Test12';
    const testPassword = 'Test22';
    const goodTestEmail = 'myEmail@hi.com';
    const testAvatar = '';
    const testSecurityQuestion: Question = { question: 'Who are you?', answer: 'Me' };

    let mongoServer: MongoMemoryServer;
    let dbService: DatabaseService;
    let authService: AuthentificationService;

    before(async () => {
        dbService = Container.get(DatabaseService);
        mongoServer = new MongoMemoryServer();
        await dbService.start(await mongoServer.getUri());
    });

    beforeEach(() => {
        authService = new AuthentificationService();
    });

    afterEach(() => {
        Sinon.restore();
    });

    after(async () => {
        if (dbService['client']) {
            await dbService['client'].close();
        }
    });

    it('authentifyUser should call isUserOnline() and should return false if user is online', async () => {
        const stubOnlineService = Sinon.stub(UsersStatusService.prototype, 'isUserOnline').returns(true);
        expect(await authService.authentifyUser(testUsername, testPassword)).to.be.false;
        assert(stubOnlineService.called);
    });

    it('authentifyUser should return true and call isUserOnline(), decryptPassword(), getUserEncryptedPassword() and addOnlineUser() if user is offline and password is right', async () => {
        const stubOnlineServiceIsOnline = Sinon.stub(UsersStatusService.prototype, 'isUserOnline').returns(false);
        const stubDbServiceGetPass = Sinon.stub(DatabaseService.prototype, 'getUserEncryptedPassword').returns(Promise.resolve(testPassword));
        const stubAuthServiceDecryptPass = Sinon.stub(AuthentificationService.prototype, 'decryptPassword' as any).returns(testPassword);
        const stubOnlineServiceAddUser = Sinon.stub(UsersStatusService.prototype, 'addOnlineUser');

        expect(await authService.authentifyUser(testUsername, testPassword)).to.be.true;
        assert(stubOnlineServiceIsOnline.called);
        assert(stubDbServiceGetPass.called);
        assert(stubOnlineServiceIsOnline.called);
        assert(stubAuthServiceDecryptPass.called);
        assert(stubOnlineServiceAddUser.called);
    });

    it('authentifyUser should return false and call isUserOnline(), decryptPassword() and getUserEncryptedPassword() if user is offline and password is wrong', async () => {
        const stubOnlineServiceIsOnline = Sinon.stub(UsersStatusService.prototype, 'isUserOnline').returns(false);
        const stubDbServiceGetPass = Sinon.stub(DatabaseService.prototype, 'getUserEncryptedPassword').returns(Promise.resolve('wrongPass'));
        const stubAuthServiceDecryptPass = Sinon.stub(AuthentificationService.prototype, 'decryptPassword' as any).returns('wrongPass');

        expect(await authService.authentifyUser(testUsername, testPassword)).to.be.false;
        assert(stubOnlineServiceIsOnline.called);
        assert(stubDbServiceGetPass.called);
        assert(stubOnlineServiceIsOnline.called);
        assert(stubAuthServiceDecryptPass.called);
    });

    it('createAccount should should return false if there is an error during the requirements verification', async () => {
        const testError = USERNAME_INVALID;
        Sinon.stub(AuthentificationService.prototype, 'verifyAccountRequirements' as any).returns(Promise.resolve(testError));
        expect(await authService.createAccount(testUsername, testPassword, goodTestEmail, testAvatar, testSecurityQuestion)).to.deep.equal(testError);
    });

    it('createAccount should should return false if there is an error with the database', async () => {
        const testError = DATABASE_UNAVAILABLE;
        const accountCreatedInDB = false;
        Sinon.stub(AuthentificationService.prototype, 'verifyAccountRequirements' as any).returns(Promise.resolve(NO_ERROR));
        Sinon.stub(DatabaseService.prototype, 'addUserAccount').returns(Promise.resolve(accountCreatedInDB));
        expect(await authService.createAccount(testUsername, testPassword, goodTestEmail, testAvatar, testSecurityQuestion)).to.deep.equal(testError);
    });

    it('createAccount should return NO_ERROR if the account was created successfully', async () => {
        const testError = NO_ERROR;
        expect(await authService.createAccount(testUsername, testPassword, goodTestEmail, testAvatar, testSecurityQuestion)).to.deep.equal(testError);
    });

    it('isSecurityQuestionAnswerRight should should return true if security question answer is the same', async () => {
        Sinon.stub(DatabaseService.prototype, 'getSecurityQuestionAsnwer').returns(Promise.resolve(testSecurityQuestion.answer));
        expect(await authService.isSecurityQuestionAnswerRight(testUsername, testSecurityQuestion.answer)).to.be.true;
    });

    it('isSecurityQuestionAnswerRight should should return false if security question answer is not the same', async () => {
        const bogusAnswer = 'Not me';
        Sinon.stub(DatabaseService.prototype, 'getSecurityQuestionAsnwer').returns(Promise.resolve(testSecurityQuestion.answer));
        expect(await authService.isSecurityQuestionAnswerRight(testUsername, bogusAnswer)).to.be.false;
    });

    it('changeUserPassword should call password encryption and then call changeUserPassword() from dbService', async () => {
        const passwordEncryptionStub = Sinon.stub(AuthentificationService.prototype, 'encryptPassword' as any);
        const dbServiceChangePassStub = Sinon.stub(DatabaseService.prototype, 'changeUserPassword').returns(Promise.resolve(true));
        authService.changeUserPassword(testUsername, testPassword + 'aaaa');
        expect(passwordEncryptionStub.called);
        expect(dbServiceChangePassStub.called);
    });

    it('verifyAccountRequirements should return USERNAME_INVALID error code when username is too short', async () => {
        const isUsernameFree = true;
        const badUsername = '';
        Sinon.stub(DatabaseService.prototype, 'isUsernameFree').returns(Promise.resolve(isUsernameFree));
        expect(await authService['verifyAccountRequirements'](badUsername, testPassword, goodTestEmail)).to.deep.equal(USERNAME_INVALID);
    });

    it('verifyAccountRequirements should return EMAIL_INVALID error code when email is invalid', async () => {
        const isUsernameFree = true;
        const badEmail = 'aaa.com';
        Sinon.stub(DatabaseService.prototype, 'isUsernameFree').returns(Promise.resolve(isUsernameFree));
        expect(await authService['verifyAccountRequirements'](testUsername, testPassword, badEmail)).to.deep.equal(EMAIL_INVALID);
    });

    it('verifyAccountRequirements should return PASSWORD_INVALID error code when password is invalid', async () => {
        const isUsernameFree = true;
        const badPassword = '';
        Sinon.stub(DatabaseService.prototype, 'isUsernameFree').returns(Promise.resolve(isUsernameFree));
        expect(await authService['verifyAccountRequirements'](testUsername, badPassword, goodTestEmail)).to.deep.equal(PASSWORD_INVALID);
    });

    it('verifyAccountRequirements should return USERNAME_TAKEN if the username is taken', async () => {
        const isUsernameFree = false;
        Sinon.stub(DatabaseService.prototype, 'isUsernameFree').returns(Promise.resolve(isUsernameFree));
        expect(await authService['verifyAccountRequirements'](testUsername, testPassword, goodTestEmail)).to.deep.equal(USERNAME_TAKEN);
    });

    it('verifyAccountRequirements should return NO_ERROR if the account information meets all the requirements', async () => {
        const isUsernameFree = true;
        Sinon.stub(DatabaseService.prototype, 'isUsernameFree').returns(Promise.resolve(isUsernameFree));
        expect(await authService['verifyAccountRequirements'](testUsername, testPassword, goodTestEmail)).to.deep.equal(NO_ERROR);
    });

    it('an encrypted password should be the same as the original word once decrypted', async () => {
        const testPasswordToEncrypt = 'I~AmA!Hero!%$~';
        const encryptedPass = authService['encryptPassword'](testPasswordToEncrypt);
        expect(authService['decryptPassword'](encryptedPass)).to.deep.equal(testPasswordToEncrypt);
    });
});
