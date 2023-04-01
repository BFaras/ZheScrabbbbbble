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
    message?: PlayerMessage;
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
    private actionMessageObservable: Observable<PlayerMessage>;
    private actionMessageObserver: Observer<PlayerMessage>; 

    private observerIndex: number;
    private tournamentGame: boolean;
    private coop: boolean;

    constructor(private socketManagerService: SocketManagerService) {
        this.gameStateObservable = new Observable((observer: Observer<GameState>) => {
            if (!this.socket.active) this.refreshSocket();
            this.gameStateObservers.push(observer);
        });
        this.actionMessageObservable = new Observable((observer: Observer<PlayerMessage>) => {
            if (!this.socket.active) this.refreshSocket();
            this.actionMessageObserver = observer;
        });
        this.refreshSocket();
    }

    refreshSocket() {
        this.gameStateObservers = [];
        this.socket = this.socketManagerService.getSocket();
        this.socket.on('Game State Update', (state: GameState) => {
            for (let observer of this.gameStateObservers) {
                observer.next(state);
            }
        });
        this.socket.on('Message Action History', (msg: PlayerMessage) => {
            this.actionMessageObserver.next(msg);
        });
    }

    getGameStateObservable(): Observable<GameState> {
        return this.gameStateObservable;
    }

    getActionMessageObservable(): Observable<PlayerMessage> {
        return this.actionMessageObservable;
    }

    requestGameState() {
        this.socket.emit('Request Game State');
    }

    sendAbandonRequest() {
        this.socket.emit('Abandon');
    }

    reconnect(id: string) {
        this.socket.emit('reconnect', id);
    }

    getObserverIndex(): number {
        return this.observerIndex;
    }

    setObserver(observerindex: number) {
        this.observerIndex = observerindex;
    }

    setCoop(isCoop: boolean){
        this.coop = isCoop;
    }

    isCoop(): boolean{
        return this.coop;
    }

    isTournamentGame(): boolean {
        return this.tournamentGame;
    }

    setTournamentGame(tournamentGame: boolean) {
        this.tournamentGame = tournamentGame;
    }
}
