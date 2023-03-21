import { Injectable } from '@angular/core';
import { ChatInfo, ChatMessage, ChatType } from '@app/classes/chat-info';
import { Message } from '@app/classes/message';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private socket: Socket;
    messageLog = new Map<string, ChatMessage[]>();

    chatMessageObserver: Observer<Map<string, ChatMessage[]>>;

    constructor(private socketManagerService: SocketManagerService) {
        this.updateSocket();
    }

    getChatsList(): Observable<ChatInfo[]> {
        this.socketManagerService.getSocket().emit('Get User Chat List');
        return new Observable((observer: Observer<ChatInfo[]>) => {
            this.socketManagerService.getSocket().once('User Chat List Response', (chatList: ChatInfo[]) => {
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

    getNewMessages(): Observable<Map<string, ChatMessage[]>> {
        return new Observable((observer: Observer<Map<string, ChatMessage[]>>) => {
            if (!this.socket.active) this.updateSocket();
            this.chatMessageObserver = observer;
        });
    }

    updateSocket() {
        this.socket = this.socketManagerService.getSocket();
        this.socket.on('New Chat Message', (id: string, message: ChatMessage) => {
            if (this.messageLog.has(id)) {
                this.messageLog.get(id)!.push(message);
                this.chatMessageObserver.next(this.messageLog);
            }
        });
    }

    sendMessage(message: string, ChatId: string) {
        this.socketManagerService.getSocket().emit('New Chat Message', message, ChatId);
    }

    sendCommand(argument: string, command: string) {
        this.socketManagerService.getSocket().emit('Play Turn', command, argument.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    }

    getMessages(): Observable<Message> {
        return new Observable((observer: Observer<Message>) => {
            this.socketManagerService.getSocket().on('new-message', (message: Message) => observer.next(message));
        });
    }

    getPublicChatObservable(): Observable<ChatInfo[]> {
        return new Observable((observer: Observer<ChatInfo[]>) => {
            this.socketManagerService.getSocket().once('Public Chat List Response', (chatList: ChatInfo[]) => {
                observer.next(chatList);
            });
        });
    }

    getPublicChats() {
        this.socketManagerService.getSocket().emit('Get Public Chat List');
    }

    leaveChat(chat: ChatInfo): Observable<string> {
        this.socketManagerService.getSocket().emit('Leave Public Chat', chat._id);
        return new Observable((observer: Observer<string>) => {
            this.socketManagerService.getSocket().once('Leave Chat Response', (errorCode: string) => {
                observer.next(errorCode);
            });
        });
    }

    joinChat(chat: ChatInfo): Observable<string> {
        this.socketManagerService.getSocket().emit('Join Public Chat', chat._id);
        return new Observable((observer: Observer<string>) => {
            this.socketManagerService.getSocket().once('Join Chat Response', (errorCode: string) => {
                observer.next(errorCode);
            });
        });
    }

    createChat(chatName: string): Observable<string> {
        this.socketManagerService.getSocket().emit('Create New Chat', chatName, ChatType.PUBLIC);
        return new Observable((observer: Observer<string>) => {
            this.socketManagerService.getSocket().once('Chat Creation Response', (errorCode: string) => {
                observer.next(errorCode);
            });
        });
    }
}
