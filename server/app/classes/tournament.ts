import { MILLISECOND_IN_MINUTES, TOURNAMENT_ROUND_START_TIMER } from '@app/constants/basic-constants';
import * as io from 'socket.io';

export const MAX_TOURNAMENT_CODE = 100000;
export const TOURNAMENT_ROUND_LENGTH = 2;

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

export class Tournament {
    private static tournamentCode: number = 0;
    private players: { socket: io.Socket, username: string, wins: number }[];
    private id: string;
    private games: GameData[] = [];
    private roundTimer: NodeJS.Timer;
    private rooms: string[];
    private round: number = 0;
    private tournamentPhase: number;
    private time: number; 

    private gameCreationCallback: (tid: string, users: io.Socket[], round: number) => string[];
    private gameStartCallback: (tid: string, rooms: string[]) => void;
    private gameEndCallback: (tid: string) => void;

    constructor(players: { socket: io.Socket, username: string }[]) {
        this.players = []
        for (let player of players) {
            this.players.push({ socket: player.socket, username: player.username, wins: 0 });
        }
        Tournament.tournamentCode = (Tournament.tournamentCode + 1) % MAX_TOURNAMENT_CODE;
        this.id = 'T' + Tournament.tournamentCode;
    }

    getID(): string {
        return this.id;
    }

    registerGame(game: GameData) {
        this.games.push(game);
    }

    updateGameStatus(id: string, status: GameStatus) {
        for (let game of this.games) {
            if (game.roomCode === id) game.status = status;
        }
    }

    updateGameRoomCodes(rooms: string[]){
        for(let i = 0; i < rooms.length; i++){
            this.games[i + 2].roomCode = rooms[i];
        }
    }

    isPlayerInTournament(username: string): boolean {
        for (let player of this.players) {
            if (player.username === username) return true;
        }
        return false;
    }

    getGameData(): GameData[] {
        return this.games;
    }

    getGameRooms(): string[] {
        return this.rooms;
    }

    startTournament(gameCreationCallback: (tid: string, users: io.Socket[], round: number) => string[], gameStartCallback: (tid: string, rooms: string[]) => void, gameEndCallback: (tid: string) => void) {
        this.gameCreationCallback = gameCreationCallback;
        this.gameStartCallback = gameStartCallback;
        this.gameEndCallback = gameEndCallback;
        this.round = 1;
        let users: io.Socket[] = [];
        for (let player of this.players) {
            users.push(player.socket);
        }
        this.rooms = this.gameCreationCallback(this.id, users, this.round);
        this.tournamentPhase = 0;
        this.time = Date.now();
        setTimeout(() => {
            this.gameStartCallback(this.id, this.rooms);
            this.startRoundTimer();
        }, TOURNAMENT_ROUND_START_TIMER);
    }

    setGameWinner(id: string, name: string, isLoser: boolean = false) {
        for (let game of this.games) {
            if (game.roomCode !== id) continue;
            let otherName = '';
            game.status = GameStatus.FINISHED;
            for (let i = 0; i < game.players.length; i++) {
                if (game.players[i] === name) {
                    if (!isLoser) {
                        game.winnerIndex = i;
                    }
                } else {
                    otherName = game.players[i];
                    if (isLoser) {
                        game.winnerIndex = i;
                    }
                }
            }
            if (game.type.includes('Semi')) {
                const loser = isLoser ? name : otherName;
                const winner = isLoser ? otherName : name;
                const final1 = this.getGame('Final1');
                if (final1) {
                    final1.players.push(winner);
                } else {
                    this.games.push({ type: 'Final1', status: GameStatus.PENDING, players: [winner], winnerIndex: 0, roomCode: '' });
                }
                const final2 = this.getGame('Final2');
                if (final2) {
                    final2.players.push(loser);
                } else {
                    this.games.push({ type: 'Final2', status: GameStatus.PENDING, players: [loser], winnerIndex: 0, roomCode: '' });
                }
            }
        }
        if (this.getGame('Semi1')?.status === GameStatus.FINISHED && this.getGame('Semi2')?.status === GameStatus.FINISHED && this.round === 1) {
            clearInterval(this.roundTimer);
            this.startSecondRound();
            return;
        }
        if (this.getGame('Final1')?.status === GameStatus.FINISHED && this.getGame('Final2')?.status === GameStatus.FINISHED && this.round === 2) {
            this.tournamentPhase = 2;
            this.time = Date.now();
            console.log('Tournament Over');
        }
    }

    getTimePhase(): {time: number, phase: number}{
        const secondsElapsed = Math.floor((Date.now() - this.time) / 1000);
        let timeLeft;
        switch(this.tournamentPhase){
            case 0 : 
                timeLeft = (TOURNAMENT_ROUND_START_TIMER / 1000) - secondsElapsed;
                break;
            case 1 : 
                timeLeft = (TOURNAMENT_ROUND_LENGTH * MILLISECOND_IN_MINUTES / 1000) - secondsElapsed;
                break;
            default  : 
                timeLeft = 0;
                break;
        }
        return {time : timeLeft, phase : this.tournamentPhase}
    }

    private startSecondRound() {
        const final1 = this.getGame('Final1');
        if (!final1) return;
        const final2 = this.getGame('Final2');
        if (!final2) return;
        this.round = 2;
        const users: string[] = final1.players.concat(final2.players);
        const sockets = this.getSocketFromNames(users);
        this.rooms = this.gameCreationCallback(this.id, sockets, this.round);
        this.tournamentPhase = 0;
        this.time = Date.now();
        setTimeout(() => {
            this.gameStartCallback(this.id, this.rooms);
            this.startRoundTimer();
        }, TOURNAMENT_ROUND_START_TIMER);
    } 

    private getSocketFromNames(users: string[]): io.Socket[] {
        const sockets = [];
        for (let user of users) {
            for (let player of this.players) {
                if (user === player.username) {
                    sockets.push(player.socket);
                    break;
                }
            }
        }
        return sockets;
    }

    private getGame(type: string): GameData | null {
        for (let game of this.games) {
            if (game.type === type) return game;
        }
        return null;
    }

    private startRoundTimer() {
        let nbMinLeft = TOURNAMENT_ROUND_LENGTH;
        this.tournamentPhase = 1;
        this.time = Date.now();
        this.roundTimer = setInterval(() => {
            nbMinLeft--;
            if (nbMinLeft <= 0) {
                clearInterval(this.roundTimer);
                this.gameEndCallback(this.id);
            }
        }, MILLISECOND_IN_MINUTES);
    }
}