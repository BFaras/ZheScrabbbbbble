/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { NO_ERROR, WRONG_SECURITY_ANSWER } from '@app/constants/error-code-constants';
import { Question } from '@app/interfaces/question';
import { Server } from 'app/server';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { DatabaseService } from './database.service';

describe('Authentification Tests', async () => {
    const testUsername = 'Test12Test589';
    const testPassword = 'tE!s&to~';
    const testGoodEmail = 'myTestMail12564@poly.com';
    const urlString = 'http://localhost:3000';
    const testAvatar = '';
    const testSecurityQuestion: Question = { question: 'Who are you?', answer: 'Me' };

    let mongoServer: MongoMemoryServer;
    let dbService: DatabaseService;
    let server: Server;
    let clientSocket: Socket;

    before(async () => {
        dbService = Container.get(DatabaseService);
        mongoServer = new MongoMemoryServer();
        await dbService.start(await mongoServer.getUri());
    });

    beforeEach(async () => {
        server = Container.get(Server);
        await server.init(true);
        clientSocket = ioClient(urlString);
    });

    afterEach(async () => {
        const userId = await dbService.getUserId(testUsername);
        await dbService.leaveChatCanal(userId, await dbService.getGlobalChatId());
        await dbService.removeUserAccount(testUsername);
        clientSocket.close();
        server['socketManager']['sio'].close();
    });

    after(async () => {
        if (dbService['client']) {
            await dbService['client'].close();
        }
    });

    it('Socket emit Create User Account should create a user account if it does not exist', (done) => {
        clientSocket.once('Creation result', (isCreationSuccess: boolean) => {
            expect(isCreationSuccess).to.be.true;
            done();
        });
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
    });

    it('Socket emit Create User Account should not create a user account if username is taken', (done) => {
        clientSocket.once('Creation result', () => {
            clientSocket.once('Creation result', (isCreationSuccess: boolean) => {
                expect(isCreationSuccess).to.be.false;
                done();
            });
            clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
        });
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
    });

    it('Socket emit User authentification should authentify existing player', (done) => {
        clientSocket.once('Creation result', () => {
            clientSocket.disconnect();
            clientSocket.connect();
            clientSocket.once('Authentification status', (isAuthSuccess: boolean) => {
                expect(isAuthSuccess).to.be.true;
                done();
            });
            clientSocket.emit('User authentification', testUsername, testPassword);
        });
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
    });

    it('Socket emit User authentification should not authentify existing player if he is already connected', (done) => {
        clientSocket.once('Creation result', () => {
            clientSocket.disconnect();
            clientSocket.connect();
            clientSocket.once('Authentification status', () => {
                clientSocket.once('Authentification status', (isAuthSuccess: boolean) => {
                    expect(isAuthSuccess).to.be.false;
                    done();
                });
                clientSocket.emit('User authentification', testUsername, testPassword);
            });
            clientSocket.emit('User authentification', testUsername, testPassword);
        });
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
    });

    it('Socket emit Account Question Answer should reset password if answer to question is correct', (done) => {
        const newPassword = '12345';
        clientSocket.once('Creation result', () => {
            clientSocket.once('User Account Question', () => {
                clientSocket.once('Password Reset response', (errorCode: string) => {
                    expect(errorCode).to.deep.equals(NO_ERROR);
                    done();
                });
                clientSocket.emit('Account Question Answer', testSecurityQuestion.answer, newPassword);
            });
            clientSocket.emit('Reset User Password', testUsername);
        });
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
    });

    it('Socket emit Account Question Answer should not reset password if answer to question is incorrect', (done) => {
        const newPassword = '12345';
        const wrongAnswer = testSecurityQuestion.answer + 'hello';
        clientSocket.once('Creation result', () => {
            clientSocket.once('User Account Question', () => {
                clientSocket.emit('Account Question Answer', wrongAnswer, newPassword);
                clientSocket.once('Password Reset response', async (errorCode: string) => {
                    expect(errorCode).to.deep.equals(WRONG_SECURITY_ANSWER);
                    done();
                });
            });
            clientSocket.emit('Reset User Password', testUsername);
        });
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
    });
});
