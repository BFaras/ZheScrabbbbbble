import * as io from 'socket.io';
import { Service } from 'typedi';

@Service()
export class AccountInfoService {
    getUsername(socket: io.Socket): string {
        return socket.data.username;
    }

    setUsername(socket: io.Socket, username: string) {
        socket.data.username = username;
    }
}
