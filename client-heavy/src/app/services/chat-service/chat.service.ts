import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private socket;

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
    }

    getClientID(): string {
        return this.socket.id;
    }

    sendMessage(message: Message) {
        this.socket.emit('new-message', message);
    }

    sendCommand(argument: string, command: string) {
        this.socket.emit('command', command, argument.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    }

    getMessages(): Observable<Message> {
        return new Observable((observer: Observer<Message>) => {
            this.socket.on('new-message', (message: Message) => observer.next(message));
        });
    }
}
