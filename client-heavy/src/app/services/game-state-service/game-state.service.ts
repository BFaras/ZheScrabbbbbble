import { Injectable } from '@angular/core';
import { Goal } from '@app/classes/goal';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

export interface GameState {
    board: string[][];
    hand: string[];
    opponentHandLength: number;
    isYourTurn: boolean;
    yourScore: number;
    opponentScore: number;
    reserveLength: number;
    gameOver: boolean;
    boardWithInvalidWords?: string[][];
    yourGoals?: Goal[];
    oppenentGoals?: Goal[];
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
            this.socket.on('game-state', (state: GameState) => observer.next(state));
        });
    }

    getPlayerNames() {
        this.socket.emit('getPlayerNames');
    }

    getPlayerNamesListener(): Observable<string[]> {
        return new Observable((observer: Observer<string[]>) => {
            this.socket.on('playerNames', (names: string[]) => observer.next(names));
        });
    }

    getPlayerID(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socket.on('sendID', (id: string) => observer.next(id));
        });
    }

    getGameStateObservable(): Observable<GameState> {
        return this.gameStateObservable;
    }

    sendAbandonRequest() {
        this.socket.emit('abandon');
    }

    notifyGameStateReceived() {
        this.socket.emit('gameStateReceived');
    }

    reconnect(id: string) {
        this.socket.emit('reconnect', id);
    }

    requestId() {
        this.socket.emit('requestId');
    }
}
