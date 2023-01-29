import { AccountCreationState } from '@app/interfaces/account-creation-state';
import * as io from 'socket.io';
import { AuthentificationService } from './authentification.service';
import { DatabaseService } from './database.service';

export class AuthSocketService {
    private readonly authentificationService: AuthentificationService = new AuthentificationService(this.dbService);

    constructor(private dbService: DatabaseService) {}
    handleAuthSockets(socket: io.Socket) {
        socket.on('User authentification', async (username: string, password: string) => {
            const isAuthentificationSuccess = await this.authentificationService.authentifyUser(username, password);
            socket.emit("Authentification status", isAuthentificationSuccess);
        });

        socket.on('Create user account', async (username: string, password: string, email: string, userAvatar: string) => {
            const accountCreationStatus: AccountCreationState = await this.authentificationService.createAccount(username, password, email, userAvatar);

            if (accountCreationStatus.accountCreationSuccess) {
                socket.emit("Authentification success", accountCreationStatus.accountCreationSuccess);
            }
            else {
                socket.emit("Account creation error", accountCreationStatus);
            }
        });
    }
}
