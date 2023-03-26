import { Injectable } from "@angular/core";
import { Observable, Observer } from "rxjs";
import { Socket } from "socket.io-client/build/esm/socket";
import { SocketManagerService } from "../socket-manager-service/socket-manager.service";

export enum GameStatus {
    PENDING,
    IN_PROGRESS,
    FINISHED
}

export interface GameData {
    type: string;
    status: GameStatus;
    players: string[];
    winnerIndex: number;
    roomCode: string;
}

@Injectable({
    providedIn: 'root',
})
export class TournamentService {

    private gameDataObservable: Observable<GameData[]>;
    private gameDataObserver: Observer<GameData[]>;
    private socket: Socket;

    constructor(private socketManagerService: SocketManagerService) {
        this.gameDataObservable = new Observable((observer: Observer<GameData[]>) => {
            if (!this.socket.active) this.refreshSocketRequests();
            this.gameDataObserver = observer;
        });
        this.refreshSocketRequests();
    }

    refreshSocketRequests() {
        this.socket = this.socketManagerService.getSocket();
        this.socket.on('Tournament Data Response', (rooms) => {
            this.gameDataObserver.next(rooms)
        });
    }

    tournamentFoundObservable(): Observable<null> {
        return new Observable((observer: Observer<null>) => {
            this.socketManagerService.getSocket().once('Tournament Found', () => {
                observer.next(null);
            });
        });
    }

    enterTournament() {
        this.socketManagerService.getSocket().emit('Enter Tournament Queue');
    }

    leaveTournament() {
        this.socketManagerService.getSocket().emit('Exit Tournament');
    }

    getGameData() {
        this.socketManagerService.getSocket().emit('Get Tournament Data');
    }

    getGameDataObservable(): Observable<GameData[]> {
        return this.gameDataObservable;
    }
}