/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { expect } from 'chai';
import { assert } from 'console';
import { AuthentificationService } from './authentification.service';
import { DatabaseService } from './database.service';
import { OnlineUsersService } from './online-users.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');

describe('AuthentificationService Tests', () => {
    const testUsername = 'Test12';
    const testPassword = 'Test22';

    let authService: AuthentificationService;

    beforeEach(() => {
        authService = new AuthentificationService();
    });

    afterEach(() => {
        Sinon.restore();
    });

    it('authentifyUser should call isUserOnline() and should return false if user is online', async () => {
        const stubOnlineService = Sinon.stub(OnlineUsersService.prototype, 'isUserOnline').returns(true);
        expect(await authService.authentifyUser(testUsername, testPassword)).to.be.false;
        assert(stubOnlineService.called);
    });

    it('authentifyUser should return true and call isUserOnline(), decryptPassword(), getUserEncryptedPassword() and addOnlineUser() if user is offline and password is right', async () => {
        const stubOnlineServiceIsOnline = Sinon.stub(OnlineUsersService.prototype, 'isUserOnline').returns(false);
        const stubDbServiceGetPass = Sinon.stub(DatabaseService.prototype, 'getUserEncryptedPassword').returns(Promise.resolve(testPassword));
        const stubAuthServiceDecryptPass = Sinon.stub(AuthentificationService.prototype, 'decryptPassword' as any).returns(testPassword);
        const stubOnlineServiceAddUser = Sinon.stub(OnlineUsersService.prototype, 'addOnlineUser');

        expect(await authService.authentifyUser(testUsername, testPassword)).to.be.true;
        assert(stubOnlineServiceIsOnline.called);
        assert(stubDbServiceGetPass.called);
        assert(stubOnlineServiceIsOnline.called);
        assert(stubAuthServiceDecryptPass.called);
        assert(stubOnlineServiceAddUser.called);
    });

    it('authentifyUser should return false and call isUserOnline(), decryptPassword() and getUserEncryptedPassword() if user is offline and password is wrong', async () => {
        const stubOnlineServiceIsOnline = Sinon.stub(OnlineUsersService.prototype, 'isUserOnline').returns(false);
        const stubDbServiceGetPass = Sinon.stub(DatabaseService.prototype, 'getUserEncryptedPassword').returns(Promise.resolve('wrongPass'));
        const stubAuthServiceDecryptPass = Sinon.stub(AuthentificationService.prototype, 'decryptPassword' as any).returns('wrongPass');

        expect(await authService.authentifyUser(testUsername, testPassword)).to.be.false;
        assert(stubOnlineServiceIsOnline.called);
        assert(stubDbServiceGetPass.called);
        assert(stubOnlineServiceIsOnline.called);
        assert(stubAuthServiceDecryptPass.called);
    });
});
