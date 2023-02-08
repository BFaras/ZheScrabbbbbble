import { CREATION_SUCCESS } from '@app/constants/account-error-code-constants';
import * as io from 'socket.io';
import { AuthentificationService } from './authentification.service';
import { DatabaseService } from './database.service';

export class AuthSocketService {
    private readonly authentificationService: AuthentificationService;

    constructor(private dbService: DatabaseService) {
        this.authentificationService = new AuthentificationService(this.dbService);
    }
    handleAuthSockets(socket: io.Socket) {
        socket.on('User authentification', async (username: string, password: string) => {
            const isAuthentificationSuccess = await this.authentificationService.authentifyUser(username, password);
            socket.emit('Authentification status', isAuthentificationSuccess);
        });

        socket.on('Create user account', async (username: string, password: string, email: string, userAvatar: string) => {
            const accountCreationStatus: string = await this.authentificationService.createAccount(username, password, email, userAvatar);
            socket.emit('Creation result', accountCreationStatus === CREATION_SUCCESS);
        });
    }
}
