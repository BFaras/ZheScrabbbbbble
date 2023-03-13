import { Injectable } from '@angular/core';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

export interface GameState {
    board: string[][];
    players: PlayerState[];
    playerTurnIndex: number;
    reserveLength: number;
    gameOver: boolean;
}

export interface PlayerState {
    username: string;
    hand: string[];
    score: number;
}

@Injectable({
    providedIn: 'root',
})
export class GameStateService {
    private socket: Socket;
    private gameStateObservable: Observable<GameState>;

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
        this.gameStateObservable = new Observable((observer: Observer<GameState>) => {
            this.socket.on('Game State Update', (state: GameState) => {
                observer.next(state)
            });
        });
    }

    getGameStateObservable(): Observable<GameState> {
        return this.gameStateObservable;
    }

    requestGameState(){
        this.socket.emit('Request Game State');
    }

    sendAbandonRequest() {
        this.socket.emit('abandon');
    }

    reconnect(id: string) {
        this.socket.emit('reconnect', id);
    }
}
