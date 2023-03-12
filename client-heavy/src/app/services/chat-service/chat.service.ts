import { Injectable } from '@angular/core';
import { ChatInfo, ChatMessage } from '@app/classes/chat-info';
import { Message } from '@app/classes/message';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    messageLog = new Map<string, ChatMessage[]>();
    chatList: ChatInfo[];

    constructor(private socketManagerService: SocketManagerService) {}

    getChatsList(): Observable<ChatInfo[]> {
        this.socketManagerService.getSocket().emit('Get User Chat List');
        return new Observable((observer: Observer<ChatInfo[]>) => {
            this.socketManagerService.getSocket().on('User Chat List Response', (chatList: ChatInfo[]) => {
                observer.next(chatList);
                this.updateChatList(chatList);
            });
        });
    }

    updateChatList(chatList: ChatInfo[]) {
        chatList.forEach((chat: ChatInfo) => {
            if (!this.messageLog.has(chat._id)) this.messageLog.set(chat._id, []);
            console.log("hello");
            console.log(this.messageLog);
        });
    }

    getClientID(): string {
        return this.socketManagerService.getSocket().id;
    }

    getNewMessages(): Observable<Map<string, ChatMessage[]>> {
        return new Observable((observer: Observer<Map<string, ChatMessage[]>>) => {
            this.socketManagerService.getSocket().on('New Chat Message', (id: string, message: ChatMessage) => {
                if (this.messageLog.has(id)) {
                    this.messageLog.get(id)!.push(message);
                    observer.next(this.messageLog);
                }
            });
        });
    }

    sendMessage(message: string, ChatId: string) {
        this.socketManagerService.getSocket().emit('New Chat Message', message, ChatId);
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
