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
    private defaultPlayersInRoom : string[];

    private waitingRoomObservable: Observable<WaitingRoom[]>;
    private waitingRoomObserver : Observer<WaitingRoom[]>;

    private joinRequestObservable: Observable<string>;
    private joinRequestObserver: Observer<string>;

    private joinRoomResponseObservable: Observable<JoinResponse>;
    private joinRoomResponseObserver: Observer<JoinResponse>;

    private gameStartObservable: Observable<null>;
    private gameStartObserver: Observer<null>;

    private roomPlayerObservable: Observable<string[]>;
    private roomPlayerObserver: Observer<string[]>;

    private socket : Socket;

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
        this.waitingRoomObservable = new Observable((observer: Observer<WaitingRoom[]>) => {
            if(!this.socket.active) this.refreshSocketRequests();
            this.waitingRoomObserver = observer;
        });
        this.refreshSocketRequests();
        this.joinRequestObservable = new Observable((observer: Observer<string>) => {
            if(!this.socket.active) this.refreshSocketRequests();
            this.joinRequestObserver = observer;
        });

        this.joinRoomResponseObservable = new Observable((observer: Observer<JoinResponse>) => {
            if(!this.socket.active) this.refreshSocketRequests();
            this.joinRoomResponseObserver = observer;
        });
        this.gameStartObservable = new Observable((observer: Observer<null>) => {
            if(!this.socket.active) this.refreshSocketRequests();
            this.gameStartObserver = observer;
        });
        this.roomPlayerObservable = new Observable((observer: Observer<string[]>) => {
            if(!this.socket.active) this.refreshSocketRequests();
            this.roomPlayerObserver = observer;
        });
        
    }

    refreshSocketRequests(){
        this.socket = this.socketManagerService.getSocket();
        this.socket.on('Game Room List Response', (rooms) => {
            this.waitingRoomObserver.next(rooms)
        });
        this.socket.on('Join Room Request', (username) => {
            this.joinRequestObserver.next(username)
        });
        this.socket.on('Join Room Response', (errorCode, playerNames) => {
            this.joinRoomResponseObserver.next({ errorCode, playerNames })
        });
        this.socket.on('Game Started', () => {
            this.gameStartObserver.next(null);
        });
        this.socket.on('Room Player Update', (playerNames) => {
            this.roomPlayerObserver.next(playerNames);
        });
    }

    setDefaultPlayersInRoom(defaultPlayers : string[]){
        this.defaultPlayersInRoom = defaultPlayers;
    }

    getDefaultPlayersInRoom(): string[]{
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
        this.socketManagerService.getSocket().emit('Join Game Room', id, password);
    }

    leaveRoom(): void {
        this.socketManagerService.getSocket().emit('Leave Game Room');
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

    getRoomPlayerObservable(): Observable<string[]> {
        return this.roomPlayerObservable;
    }

    createMultiRoom(roomName: string, visibility: string, passwordRoom: string) {
        console.log(this.socketManagerService.getSocket());
        this.socketManagerService.getSocket().emit('Create Game Room', roomName, visibility, passwordRoom);
    }

    startGame() {
        this.socketManagerService.getSocket().emit('Start Game');
    }

    createRoomResponse(): Observable<any> {
        return new Observable((observer: Observer<any>) => {
            this.socketManagerService.getSocket().once('Room Creation Response', (response) => observer.next(response));
        });
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
}
