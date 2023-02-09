import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {

    constructor(private socketManagerService: SocketManagerService) {}

    getClientID(): string {
        return this.socketManagerService.getSocket().id;
    }

    sendMessage2(message: string) {
        console.log(message);
        this.socketManagerService.getSocket().emit('Message Sent', message);
    }

    getNewMessages(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socketManagerService.getSocket().on('New Message', (message: string) => observer.next(message));
        });
    }

    sendMessage(message: Message) {
        this.socketManagerService.getSocket().emit('new-message', message);
    }

    sendCommand(argument: string, command: string) {
        this.socketManagerService.getSocket().emit('command', command, argument.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    }

    getMessages(): Observable<Message> {
        return new Observable((observer: Observer<Message>) => {
            this.socketManagerService.getSocket().on('new-message', (message: Message) => observer.next(message));
        });
    }
}
