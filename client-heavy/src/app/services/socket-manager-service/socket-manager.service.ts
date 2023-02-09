import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketManagerService {
    socket: Socket;

    constructor() {
        this.createSocket()
    }

    createSocket(){
        this.socket = io(environment.serverUrl);
    }

    getSocket(): Socket {
        return this.socket;
    }
}
