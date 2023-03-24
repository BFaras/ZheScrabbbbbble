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
    winnerIndex : number;
    roomCode : string;
}

@Injectable({
    providedIn: 'root',
})
export class TournamentService {
    private gameData : GameData[] = [];

    constructor(private socketManagerService: SocketManagerService){}

    tournamentFoundObservable(): Observable<null> {
        return new Observable((observer: Observer<null>) => {
            this.socketManagerService.getSocket().once('Tournament Found', (gameData) => {
                this.gameData = gameData;
                observer.next(null);
            });
        });
    }

    enterTournament() {
        this.socketManagerService.getSocket().emit('Enter Tournament Queue');
    }

    leaveTournament(){
        this.socketManagerService.getSocket().emit('Exit Tournament');
    }

    getGameData() : GameData[]{
        return this.gameData
    }
}