import { CREATION_SUCCESS } from '@app/constants/account-error-code-constants';
import { Question } from '@app/interfaces/question';
import * as io from 'socket.io';
import Container, { Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { AuthentificationService } from './authentification.service';

@Service()
export class AuthSocketService {
    private readonly authentificationService: AuthentificationService;
    private readonly accountInfoService: AccountInfoService;

    constructor() {
        this.authentificationService = Container.get(AuthentificationService);
        this.accountInfoService = Container.get(AccountInfoService);
    }
    handleAuthSockets(socket: io.Socket) {
        socket.on('User authentification', async (username: string, password: string) => {
            const isAuthentificationSuccess = await this.authentificationService.authentifyUser(username, password);
            if (isAuthentificationSuccess) {
                this.accountInfoService.setUsername(socket, username);
                console.log(new Date().toLocaleTimeString() + ' | Login successfull');
            }
            socket.emit('Authentification status', isAuthentificationSuccess);
        });

        socket.on(
            'Create user account',
            async (username: string, password: string, email: string, userAvatar: string, securityQuestion: Question) => {
                const accountCreationStatus: string = await this.authentificationService.createAccount(
                    username,
                    password,
                    email,
                    userAvatar,
                    securityQuestion,
                );
                if (accountCreationStatus === CREATION_SUCCESS) {
                    this.accountInfoService.setUsername(socket, username);
                    console.log(new Date().toLocaleTimeString() + ' | Register successfull');
                }
                socket.emit('Creation result', accountCreationStatus === CREATION_SUCCESS);
            },
        );

        socket.on('Reset User Password', async (username: string) => {
            socket.data.usernameResettingPassword = username;
            socket.emit('Authentification status', await this.authentificationService.getUserSecurityQuestion(username));
        });

        socket.on('Account Question Answer', async (answerToQuestion: string, newPassword: string) => {
            const usernameForReset = socket.data.usernameResettingPassword;
            const errorCode = '1';
            if (await this.authentificationService.isSecurityQuestionAnswerRight(usernameForReset, newPassword)) {
                socket.data.usernameResettingPassword = null;
            }
            socket.emit('Password Reset response', errorCode);
        });
    }
}
