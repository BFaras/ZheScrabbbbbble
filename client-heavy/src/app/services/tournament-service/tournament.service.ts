import { Injectable } from "@angular/core";
import { Observable, Observer } from "rxjs";
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

    constructor(private socketManagerService: SocketManagerService) {}

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

    getGameData(): Observable<GameData[]> {
        this.socketManagerService.getSocket().emit('Get Tournament Data');
        return new Observable((observer: Observer<GameData[]>) => {
            this.socketManagerService.getSocket().once('Tournament Data Response', (data) => {
                observer.next(data);
            });
        });
    }
}