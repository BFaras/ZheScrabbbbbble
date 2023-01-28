import { Injectable } from '@angular/core';
import { GameType } from '@app/constants/game-types';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

export interface TopScores {
    [key: string]: string[];
}

const NUMBER_OF_RESULTS = 5;

@Injectable({
    providedIn: 'root',
})
export class LeaderboardService {
    private socket: Socket;

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
    }

    getTopScoresObservable(): Observable<TopScores> {
        return new Observable((observer: Observer<TopScores>) => {
            this.socket.on('topScores', (topScores: TopScores) => observer.next(topScores));
        });
    }

    requestTopScores(gameType: GameType) {
        this.socket.emit('requestTopScores', NUMBER_OF_RESULTS, gameType);
    }
}
