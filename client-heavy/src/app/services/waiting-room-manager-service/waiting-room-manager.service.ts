import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer';
import { WaitingRoom } from '@app/classes/waiting-room';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ChatService } from '../chat-service/chat.service';

export interface Settings {
    playerName: string;
    timer: Timer;
}

export interface JoinResponse {
    errorCode: string;
    playerNames?: string[];
}

@Injectable({
    providedIn: 'root',
})
export class WaitingRoomManagerService {
    private requestPending: boolean = false;
    private defaultPlayersInRoom: string[];

    private waitingRoomObservable: Observable<WaitingRoom[]>;
    private waitingRoomObserver: Observer<WaitingRoom[]>;

    private joinRequestObservable: Observable<[string, boolean]>;
    private joinRequestObserver: Observer<[string, boolean]>;

    private joinRoomResponseObservable: Observable<JoinResponse>;
    private joinRoomResponseObserver: Observer<JoinResponse>;

    private gameStartObservable: Observable<{ isCoop: boolean, roomCode?: string }>;
    private gameStartObserver: Observer<{ isCoop: boolean, roomCode?: string }>;

    private roomPlayerObservable: Observable<string[]>;
    private roomPlayerObserver: Observer<string[]>;

    private socket: Socket;
    private observer: boolean;

    constructor(private socketManagerService: SocketManagerService, private chatService: ChatService) {
        this.socket = this.socketManagerService.getSocket();
        this.waitingRoomObservable = new Observable((observer: Observer<WaitingRoom[]>) => {
            if (!this.socket.active) this.refreshSocketRequests();
            this.waitingRoomObserver = observer;
        });
        this.refreshSocketRequests();
        this.joinRequestObservable = new Observable((observer: Observer<[string, boolean]>) => {
            if (!this.socket.active) this.refreshSocketRequests();
            this.joinRequestObserver = observer;
        });

        this.joinRoomResponseObservable = new Observable((observer: Observer<JoinResponse>) => {
            if (!this.socket.active) this.refreshSocketRequests();
            this.joinRoomResponseObserver = observer;
        });
        this.gameStartObservable = new Observable((observer: Observer<{ isCoop: boolean, roomCode?: string }>) => {
            if (!this.socket.active) this.refreshSocketRequests();
            this.gameStartObserver = observer;
        });
        this.roomPlayerObservable = new Observable((observer: Observer<string[]>) => {
            if (!this.socket.active) this.refreshSocketRequests();
            this.roomPlayerObserver = observer;
        });

    }

    refreshSocketRequests() {
        this.socket = this.socketManagerService.getSocket();
        this.socket.on('Game Room List Response', (rooms) => {
            this.waitingRoomObserver.next(rooms)
        });
        this.socket.on('Join Room Request', (username, observer) => {
            this.joinRequestObserver.next([username, observer])
        });
        this.socket.on('Join Room Response', (errorCode, playerNames) => {
            this.joinRoomResponseObserver.next({ errorCode, playerNames })
        });
        this.socket.on('Game Started', (isCoop: boolean, roomCode?: string) => {
            this.gameStartObserver.next({ isCoop, roomCode });
        });
        this.socket.on('Room Player Update', (playerNames) => {
            this.roomPlayerObserver.next(playerNames);
        });
    }

    setDefaultPlayersInRoom(defaultPlayers: string[]) {
        this.defaultPlayersInRoom = defaultPlayers;
    }

    getDefaultPlayersInRoom(): string[] {
        return this.defaultPlayersInRoom;
    }

    isRequestPending(): boolean {
        return this.requestPending;
    }

    setRequestPending(requestPending: boolean) {
        this.requestPending = requestPending;
    }

    getGameRoomActive() {
        this.socketManagerService.getSocket().emit('Get Game Room List');
    }

    joinRoom(id: string, password?: string): void {
        this.socketManagerService.getSocket().emit('Join Game Room', id, this.observer, password);
    }

    leaveRoom(): void {
        this.chatService.setChatInGameRoom('');
        this.socketManagerService.getSocket().emit('Leave Game Room');
    }

    getWaitingRoomObservable(): Observable<WaitingRoom[]> {
        return this.waitingRoomObservable;
    }

    getJoinRoomRequestObservable(): Observable<[string, boolean]> {
        return this.joinRequestObservable;
    }

    getStartGameObservable(): Observable<{ isCoop: boolean, roomCode?: string }> {
        return this.gameStartObservable;
    }

    getRoomPlayerObservable(): Observable<string[]> {
        return this.roomPlayerObservable;
    }

    createMultiRoom(roomName: string, visibility: string, passwordRoom: string, gameType: string) {
        console.log(this.socketManagerService.getSocket());
        this.socketManagerService.getSocket().emit('Create Game Room', roomName, visibility, passwordRoom, gameType);
    }

    startGame() {
        this.socketManagerService.getSocket().emit('Start Game');
    }

    createRoomResponse(): Observable<{ codeError: string, roomId: string }> {
        return new Observable((observer: Observer<{ codeError: string, roomId: string }>) => {
            this.socketManagerService.getSocket().once('Room Creation Response', (codeErrorResponse, roomIdResponse) => {
                const response = {
                    codeError: codeErrorResponse as string,
                    roomId: roomIdResponse as string,
                }
                observer.next(response)
            });
        });
    }

    isGameStartedResponse(): Observable<{ answer: boolean, isCoop: boolean }> {
        return new Observable((observer: Observer<{ answer: boolean, isCoop: boolean }>) => {
            this.socketManagerService.getSocket().once('Is Game Started Response', (answer, isCoop) => observer.next({ answer, isCoop }));
        });
    }

    isGameStarted() {
        this.socketManagerService.getSocket().emit('Is Game Started');
    }

    joinRoomResponse(): Observable<JoinResponse> {
        return this.joinRoomResponseObservable;
    }

    cancelJoinGameRoom() {
        this.socketManagerService.getSocket().emit('Cancel Join Request');
    }

    respondJoinRequest(answer: boolean, username: string) {
        this.socketManagerService.getSocket().emit('Join Request Response', answer, username);
    }

    setObserver(isObserver: boolean) {
        this.observer = isObserver;
    }

    isObserver(): boolean {
        return this.observer;
    }
}
