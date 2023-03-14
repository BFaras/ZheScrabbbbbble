import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer';
import { WaitingRoom } from '@app/classes/waiting-room';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

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
    private playersInRoom: string[] = [];
    private socket: Socket;
    private waitingRoomObservable: Observable<WaitingRoom[]>;
    private joinRequestObservable: Observable<string>;
    private joinRoomResponseObservable: Observable<JoinResponse>;
    private gameStartObservable: Observable<null>;

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
        this.waitingRoomObservable = new Observable((observer: Observer<WaitingRoom[]>) => {
            this.socket.on('Game Room List Response', (rooms) => {
                observer.next(rooms)
            });
        });
        this.joinRequestObservable = new Observable((observer: Observer<string>) => {
            this.socket.on('Join Room Request', (username) => {
                observer.next(username)
            });
        });
        this.joinRoomResponseObservable = new Observable((observer: Observer<JoinResponse>) => {
            this.socket.on('Join Room Response', (errorCode, playerNames) => {
                observer.next({ errorCode, playerNames })
            });
        });
        this.gameStartObservable = new Observable((observer: Observer<null>) => {
            this.socket.on('Game Started', () => {
                observer.next(null);
            });
        });
        this.socket.on('Room Player Update', (playerNames) => {
            this.playersInRoom = playerNames;
        });
    }

    isRequestPending(): boolean {
        return this.requestPending;
    }

    setRequestPending(requestPending: boolean) {
        this.requestPending = requestPending;
    }

    getPlayersInRoom() {
        return this.playersInRoom;
    }

    setPlayersInRoom(players: string[]) {
        this.playersInRoom = players;
    }

    getGameRoomActive() {
        this.socket.emit('Get Game Room List');
    }

    joinRoom(id: string, password?: string): void {
        this.socket.emit('Join Game Room', id, password);
    }

    leaveRoom(): void {
        this.socket.emit('Leave Game Room');
    }

    getWaitingRoomObservable(): Observable<WaitingRoom[]> {
        return this.waitingRoomObservable;
    }

    getJoinRoomRequestObservable(): Observable<string> {
        return this.joinRequestObservable;
    }

    getStartGameObservable(): Observable<null> {
        return this.gameStartObservable;
    }

    createMultiRoom(roomName: string, visibility: string, passwordRoom: string) {
        this.socket.emit('Create Game Room', roomName, visibility, passwordRoom);
    }

    startGame() {
        this.socket.emit('Start Game');
    }

    createRoomResponse(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socket.once('Room Creation Response', (errorCode) => observer.next(errorCode));
        });
    }

    joinRoomResponse(): Observable<JoinResponse> {
        return this.joinRoomResponseObservable;
    }

    cancelJoinGameRoom() {
        this.socket.emit('Cancel Join Request');
    }

    respondJoinRequest(answer: boolean, username: string) {
        this.socket.emit('Join Request Response', answer, username);
    }
}
