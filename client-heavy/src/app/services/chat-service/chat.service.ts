import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ChatInfo, ChatMessage, ChatType, MessageInfo } from '@app/classes/chat-info';
import { NO_ERROR } from '@app/constants/error-codes';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private socket: Socket;
    messageLog = new Map<string, ChatMessage[]>();
    chatList: ChatInfo[] = [];
    chatInGameRoom: string;
    chatMessageObserver: Observer<MessageInfo>;
    active: string = 'chat';

    private friendToSelect: string = '';
    private popupOpen: boolean = false;
    private changeDetector: ChangeDetectorRef;

    constructor(private socketManagerService: SocketManagerService) {
        this.updateSocket();
        if ((window as any).setChatStatusCallback) {
            (window as any).setChatStatusCallback(this.updateChatStatus.bind(this));
            this.popupOpen = (window as any).chatOpen;
        }

        this.socketManagerService.getSocket().on('Chat Deleted', (chatCode: string) => {
            this.messageLog.delete(chatCode);
        });
    }

    isPopupOpen(): boolean {
        return this.popupOpen;
    }

    setFriendToSelect(username: string) {
        this.friendToSelect = username;
    }

    getFriendToSelect(): string {
        return this.friendToSelect;
    }

    setChangeDetector(changeDetector: ChangeDetectorRef) {
        this.changeDetector = changeDetector;
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

    updateChatStatus() {
        if ((window as any).chatOpen !== null && (window as any).chatOpen !== undefined) {
            this.popupOpen = (window as any).chatOpen;
            this.changeDetector.detectChanges();
        }
    }

    linkSocketToUsername(username: string) {
        this.socketManagerService.getSocket().emit('Link Socket Username', username);
    }

    updateChatList(chatList: ChatInfo[]) {
        chatList.forEach((chat: ChatInfo) => {
            if (!this.messageLog.has(chat._id)) this.messageLog.set(chat._id, []);
        });
    }

    getClientID(): string {
        return this.socketManagerService.getSocket().id;
    }

    getNewMessages(): Observable<MessageInfo> {
        return new Observable((observer: Observer<MessageInfo>) => {
            if (!this.socket.active) this.updateSocket();
            this.chatMessageObserver = observer;
        });
    }

    updateSocket() {
        this.socket = this.socketManagerService.getSocket();
        this.socket.on('New Chat Message', (id: string, message: ChatMessage) => {
            console.log
            if (this.messageLog.has(id)) {
                this.chatMessageObserver.next({ id, message });
            }
        });
    }

    isUserInChat(chatCode: string) {
        return this.messageLog.has(chatCode);
    }

    sendMessage(message: string, chatId: string) {
        this.socketManagerService.getSocket().emit('New Chat Message', message, chatId);
    }

    linkGameChat(chatId: string) {
        this.socketManagerService.getSocket().emit('Link Socket Room', chatId);
    }

    unlinkGameChat() {
        this.socketManagerService.getSocket().emit('Unlink Socket Room');
    }

    sendCommand(argument: string, command: string) {
        this.socketManagerService.getSocket().emit('Play Turn', command, argument.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    }

    getChatInGameRoom(): string {
        return this.chatInGameRoom;
    }

    setChatInGameRoom(chatGameRoom: string) {
        if ((window as any).updateRoomChat) (window as any).updateRoomChat(chatGameRoom);
        this.chatInGameRoom = chatGameRoom;
    }

    getMessagesInGame(): Observable<{ chatCode: string, message: ChatMessage }> {
        return new Observable((observer: Observer<{ chatCode: string, message: ChatMessage }>) => {
            this.socketManagerService.getSocket().on('New Chat Message', (chatCode: string, chatMessage: ChatMessage) => {
                console.log("reception dans observable")
                const response = {
                    chatCode: chatCode as string,
                    message: chatMessage as ChatMessage,
                }
                observer.next(response)
            });
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
                if (errorCode === NO_ERROR) {
                    this.messageLog.delete(chat._id);
                }
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

    setActive(mode: string) {
        this.active = mode;
    }

    getActive() {
        return this.active;
    }

    getChatHistory(chatId: string): Observable<ChatMessage[]> {
        this.socketManagerService.getSocket().emit('Get Chat History', chatId);
        return new Observable((observer: Observer<ChatMessage[]>) => {
            this.socketManagerService.getSocket().once('Chat History Response', (chatHistory: ChatMessage[]) => {
                observer.next(chatHistory);
            });
        });
    }
}
