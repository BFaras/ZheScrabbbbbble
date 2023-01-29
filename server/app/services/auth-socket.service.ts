import * as io from 'socket.io';
import { AuthentificationService } from './authentification.service';
import { DatabaseService } from './database.service';

export class AuthSocketService {
    private readonly authentificationService: AuthentificationService = new AuthentificationService(this.dbService);

    constructor(private dbService: DatabaseService) {}
    handleAuthSockets(socket: io.Socket) {
        socket.on('User authentification', (username: string, password: string) => {
            this.authentificationService.authentifyUser(username, password);
        });

        socket.on('Create user account', async (username: string, password: string, email: string, userAvatar: string) => {
            await this.authentificationService.createAccount(username, password, email, userAvatar);
        });
    }
}
