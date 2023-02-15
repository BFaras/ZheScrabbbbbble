/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { NO_ERROR, WRONG_SECURITY_ANSWER } from '@app/constants/error-code-constants';
import { Question } from '@app/interfaces/question';
import { Server } from 'app/server';
import { expect } from 'chai';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { DatabaseService } from './database.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');

describe('Authentification Tests', async () => {
    const testUsername = 'Test1276776';
    const testPassword = 'tE!s&to~';
    const testGoodEmail = 'myTestMail12564@poly.com';
    const urlString = 'http://localhost:3000';
    const testAvatar = '';
    const testSecurityQuestion: Question = { question: 'Who are you?', answer: 'Me' };

    let dbService: DatabaseService;
    let server: Server;
    let clientSocket: Socket;

    beforeEach(async () => {
        server = Container.get(Server);
        dbService = Container.get(DatabaseService);
        await server.init(true);
        clientSocket = ioClient(urlString);
    });

    afterEach(async () => {
        await dbService.removeUserAccount(testUsername);
        clientSocket.close();
        server['socketManager']['sio'].close();
        Sinon.restore();
    });

    it('Socket emit Create User Account should create a user account if it does not exist', (done) => {
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
        clientSocket.once('Creation result', async (isCreationSuccess: boolean) => {
            expect(isCreationSuccess).to.be.true;
            done();
        });
    });

    it('Socket emit Create User Account should not create a user account if username is taken', (done) => {
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
        clientSocket.once('Creation result', async () => {
            clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
            clientSocket.once('Creation result', async (isCreationSuccess: boolean) => {
                expect(isCreationSuccess).to.be.false;
                done();
            });
        });
    });

    it('Socket emit User authentification should authentify existing player', (done) => {
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
        clientSocket.once('Creation result', async () => {
            clientSocket.emit('User authentification', testUsername, testPassword);
            clientSocket.once('Authentification status', async (isAuthSuccess: boolean) => {
                expect(isAuthSuccess).to.be.true;
                done();
            });
        });
    });

    it('Socket emit User authentification should not authentify existing player if he is already connected', (done) => {
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
        clientSocket.once('Creation result', async () => {
            clientSocket.emit('User authentification', testUsername, testPassword);
            clientSocket.once('Authentification status', async () => {
                clientSocket.emit('User authentification', testUsername, testPassword);
                clientSocket.once('Authentification status', async (isAuthSuccess: boolean) => {
                    expect(isAuthSuccess).to.be.false;
                    done();
                });
            });
        });
    });

    it('Socket emit Account Question Answer should reset password if answer to question is correct', (done) => {
        const newPassword = '12345';
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
        clientSocket.once('Creation result', async () => {
            clientSocket.emit('Reset User Password', testUsername);
            clientSocket.once('Creation result', async () => {
                clientSocket.emit('Account Question Answer', testSecurityQuestion.answer, newPassword);
                clientSocket.once('Password Reset response', async (errorCode: string) => {
                    expect(errorCode).to.deep.equals(NO_ERROR);
                    done();
                });
            });
        });
    });

    it('Socket emit Account Question Answer should not reset password if answer to question is incorrect', (done) => {
        const newPassword = '12345';
        const wrongAnswer = testSecurityQuestion.answer + 'hello';
        clientSocket.emit('Create user account', testUsername, testPassword, testGoodEmail, testAvatar, testSecurityQuestion);
        clientSocket.once('Creation result', async () => {
            clientSocket.emit('Reset User Password', testUsername);
            clientSocket.once('Creation result', async () => {
                clientSocket.emit('Account Question Answer', wrongAnswer, newPassword);
                clientSocket.once('Password Reset response', async (errorCode: string) => {
                    expect(errorCode).to.deep.equals(WRONG_SECURITY_ANSWER);
                    done();
                });
            });
        });
    });
});
