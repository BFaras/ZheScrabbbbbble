import * as io from 'socket.io';
import { AuthentificationService } from './authentification.service';

export class AuthSocketService {
    private readonly authentificationService: AuthentificationService = new AuthentificationService();
    handleAuthSockets(socket: io.Socket) {
        socket.on('User authentification', (username: string, password: string) => {
            this.authentificationService.authentifyUser(username, password);
        });

        socket.on('Create user account', (username: string, password: string, email: string, userAvatar: string) => {
            this.authentificationService.createAccount(username, password, email, userAvatar);
        });
    }
}
