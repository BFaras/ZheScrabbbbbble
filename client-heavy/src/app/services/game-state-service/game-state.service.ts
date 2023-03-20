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
    message ?: PlayerMessage;
}

export interface PlayerMessage {
    messageType: string;
    values: string[];
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
    private gameStateObservers: Observer<GameState>[] = [];
    private observer : boolean;

    constructor(private socketManagerService: SocketManagerService) {
        this.gameStateObservable = new Observable((observer: Observer<GameState>) => {
            if(!this.socket.active) this.refreshSocket();
            this.gameStateObservers.push(observer);
        });
        this.refreshSocket();
    }

    refreshSocket(){
        this.gameStateObservers = [];
        this.socket = this.socketManagerService.getSocket();
        this.socket.on('Game State Update', (state: GameState) => {
            console.log(state.message);
            for(let observer of this.gameStateObservers){
                observer.next(state);
            }
        });
    }

    getGameStateObservable(): Observable<GameState> {
        return this.gameStateObservable;
    }

    requestGameState(){
        this.socket.emit('Request Game State');
    }

    sendAbandonRequest() {
        this.socket.emit('Abandon');
    }

    reconnect(id: string) {
        this.socket.emit('reconnect', id);
    }

    isObserver() : boolean{
        return this.observer;
    }

    setObserver(observer : boolean){
        this.observer = observer;
    }
}
