import { MILLISECOND_IN_MINUTES, TOURNAMENT_ROUND_START_TIMER } from '@app/constants/basic-constants';
import * as io from 'socket.io';

export const MAX_TOURNAMENT_CODE = 100000;
export const TOURNAMENT_ROUND_LENGTH = 2;
export const TIME_LEFT_WARNINGS = [10, 5, 1];

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

    private gameCreationCallback: (tid: string, users: (io.Socket|null)[], round: number) => string[];
    private gameStartCallback: (tid: string, rooms: string[]) => void;
    private gameEndCallback: (tid: string) => void;
    private timerMessageCallback: (tid: string, timeLeft: string) => void;

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

    removePlayer(username: string){
        let index = -1;
        for (let player of this.players) {
            if (player.username === username){
                index = this.players.indexOf(player);
                break;
            }
        }
        if(index < 0) return;
        this.players.splice(index, 1);
    }

    getGameData(): GameData[] {
        return this.games;
    }

    getGameRooms(): string[] {
        return this.rooms;
    }

    startTournament(gameCreationCallback: (tid: string, users: io.Socket[], round: number) => string[], gameStartCallback: (tid: string, rooms: string[]) => void, gameEndCallback: (tid: string) => void, timerMessageCallback: (tid : string, timeLeft : string) => void) {
        this.gameCreationCallback = gameCreationCallback;
        this.gameStartCallback = gameStartCallback;
        this.gameEndCallback = gameEndCallback;
        this.timerMessageCallback = timerMessageCallback;
        this.round = 1;
        let users: io.Socket[] = [];
        for (let player of this.players) {
            users.push(player.socket);
        }
        this.rooms = this.gameCreationCallback(this.id, users, this.round);
        this.tournamentPhase = 0;
        this.time = Date.now();
        setTimeout(() => {
            this.startRoundTimer();
            this.gameStartCallback(this.id, this.rooms);
        }, TOURNAMENT_ROUND_START_TIMER);
    }

    setGameWinner(id: string, name: string, isLoser: boolean = false) {
        for (let game of this.games) {
            if (game.roomCode !== id) continue;
            let otherName = '';
            game.status = GameStatus.FINISHED;
            if(!name) {
                game.winnerIndex = -1;
            }else{
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
            }
            if (game.type.includes('Semi')) {
                let loser = isLoser ? name : otherName;
                if(!loser) loser = 'N/A';
                else if(!this.getSocketFromName(loser)) loser = 'N/A';
                let winner = isLoser ? otherName : name;
                if(!winner) winner = 'N/A';
                else if(!this.getSocketFromName(winner)) winner = 'N/A';
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
        const final1 = this.getGame('Final1');
        const final2 = this.getGame('Final2');
        if (final1?.status === GameStatus.FINISHED && final2?.status === GameStatus.FINISHED && this.round === 2) {
            this.tournamentPhase = 2;
            this.time = Date.now();
            const firstPlace = final1?.players[final1.winnerIndex];
            const secondPlace = final1?.players[(final2.winnerIndex + 1) % 2];
            const thridPlace = final2?.players[final2.winnerIndex];
            if(firstPlace !== 'N/A'){
                //TODO Give gold medal
            }
            if(secondPlace !== 'N/A'){
                //TODO Give silver medal
            }
            if(thridPlace !== 'N/A'){
                //TODO Give bronze medal
            }
            console.log(new Date().toLocaleTimeString() + ' | Tournament Over');
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

    getSocketFromName(user: string): (io.Socket|null){
        for (let player of this.players) {
            if (user === player.username) {
                return player.socket;
            }
        }
        return null;
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
            this.startRoundTimer();
            this.gameStartCallback(this.id, this.rooms);
        }, TOURNAMENT_ROUND_START_TIMER);
    } 

    private getSocketFromNames(users: string[]): (io.Socket|null)[] {
        const sockets = [];
        for (let user of users) {
            sockets.push(this.getSocketFromName(user));
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
            if(TIME_LEFT_WARNINGS.includes(nbMinLeft)){
                this.timerMessageCallback(this.id, nbMinLeft.toString());
            }
            if(nbMinLeft <= 0) {
                clearInterval(this.roundTimer);
                this.gameEndCallback(this.id);
            }
        }, MILLISECOND_IN_MINUTES);
    }
}