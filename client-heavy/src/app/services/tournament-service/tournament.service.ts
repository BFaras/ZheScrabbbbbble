import { Injectable } from "@angular/core";
import { Observable, Observer } from "rxjs";
import { SocketManagerService } from "../socket-manager-service/socket-manager.service";

export enum GameStatus{
    PENDING,
    IN_PROGRESS,
    FINISHED
}

export interface GameData {
    type : string;
    status : GameStatus;
    players : string[];
    roomCode : string;
}

@Injectable({
    providedIn: 'root',
})
export class TournamentService {
    constructor(private socketManagerService: SocketManagerService){}

    tournamentFoundObservable(): Observable<GameData[]> {
        return new Observable((observer: Observer<GameData[]>) => {
            this.socketManagerService.getSocket().once('Tournament Found', (gameData) => observer.next(gameData));
        });
    }

    enterTournament() {
        this.socketManagerService.getSocket().emit('Enter Tournament Queue');
    }

    leaveTournament(){
        this.socketManagerService.getSocket().emit('Exit Tournament');
    }

}