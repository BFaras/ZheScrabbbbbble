import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { ChatInfo, ChatMessage, MessageInfo } from '@app/components/chat/chat-info';
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
        });
    }

    getClientID(): string {
        return this.socketManagerService.getSocket().id;
    }

    sendMessage2(message: string) {
        this.socketManagerService.getSocket().emit('Message Sent', message);
    }

    getNewMessages(): Observable<MessageInfo> {
        return new Observable((observer: Observer<MessageInfo>) => {
            this.socketManagerService.getSocket().on('New Chat Message', (id: string, message: ChatMessage) => {
                if (this.messageLog.has(id)) {
                    observer.next({ id, message });
                    this.messageLog.get(id)!.push(message);
                }
            });
        });
    }

    sendMessage(message: Message, id: string) {
        this.socketManagerService.getSocket().emit('New Chat Message', message, id);
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
