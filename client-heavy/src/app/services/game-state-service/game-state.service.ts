import { Injectable } from '@angular/core';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ChatService } from '../chat-service/chat.service';

export interface GameState {
    board: string[][];
    players: PlayerState[];
    playerTurnIndex: number;
    reserveLength: number;
    gameOver: boolean;
    timeLeft: number;
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
    private clueObservable: Observable<{command: string, value: number}[]>;
    private clueObserver: Observer<{command: string, value: number}[]>;

    private observerIndex: number;
    private tournamentGame: boolean;
    private coop: boolean;
    private pendingAction: boolean = false;

    constructor(private socketManagerService: SocketManagerService, private chatService: ChatService) {
        this.gameStateObservable = new Observable((observer: Observer<GameState>) => {
            if (!this.socket.active) this.refreshSocket();
            this.gameStateObservers.push(observer);
        });
        this.actionMessageObservable = new Observable((observer: Observer<PlayerMessage>) => {
            if (!this.socket.active) this.refreshSocket();
            this.actionMessageObserver = observer;
        });
        this.clueObservable = new Observable((observer: Observer<{command: string, value: number}[]>) => {
            if (!this.socket.active) this.refreshSocket();
            this.clueObserver = observer;
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
        this.socket.on('Clue Response', (clues: {command: string, value: number}[]) => {
            this.clueObserver.next(clues);
        });
    }

    requestClue() {
        this.socketManagerService.getSocket().emit('Request Clue');
    }

    getClueObservable(): Observable<{command: string, value: number}[]> {
        return this.clueObservable;
    }

    getGameStateObservable(): Observable<GameState> {
        return this.gameStateObservable;
    }

    getActionMessageObservable(): Observable<PlayerMessage> {
        return this.actionMessageObservable;
    }

    requestGameState() {
        this.socketManagerService.getSocket().emit('Request Game State');
    }

    sendAbandonRequest() {
        this.chatService.setChatInGameRoom('');
        this.socketManagerService.getSocket().emit('Abandon');
    }

    respondCoopAction(response: boolean) {
        this.socketManagerService.getSocket().emit('Respond Coop Action', response);
    }

    getObserverIndex(): number {
        return this.observerIndex;
    }

    setObserver(observerindex: number) {
        this.observerIndex = observerindex;
    }

    setCoop(isCoop: boolean) {
        this.coop = isCoop;
    }

    isCoop(): boolean {
        return this.coop;
    }

    isTournamentGame(): boolean {
        return this.tournamentGame;
    }

    setTournamentGame(tournamentGame: boolean) {
        this.tournamentGame = tournamentGame;
    }

    setPendingAction(pendingAction: boolean) {
        this.pendingAction = pendingAction;
    }

    hasPendingAction(): boolean {
        return this.pendingAction;
    }
}
