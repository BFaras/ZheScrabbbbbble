import { MILLISECOND_IN_MINUTES, TOURNAMENT_ROUND_START_TIMER } from '@app/constants/basic-constants';
import * as io from 'socket.io';

export const MAX_TOURNAMENT_CODE = 100000;
export const TOURNAMENT_ROUND_LENGTH = 20;

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

export class Tournament{
    private static tournamentCode : number = 0;
    private players : {socket : io.Socket, username: string, wins: number}[];
    private id : string;
    private games : GameData[] = [];
    private roundTimer : NodeJS.Timer;
    private rooms : string[];

    constructor(players: {socket : io.Socket, username: string}[]){
        this.players = []
        for(let player of players){
            this.players.push({socket: player.socket, username: player.username, wins: 0});
        }
        Tournament.tournamentCode = (Tournament.tournamentCode + 1) % MAX_TOURNAMENT_CODE;
        this.id = 'T' + Tournament.tournamentCode;
    }

    getID(): string{
        return this.id;
    }

    registerGame(game : GameData){
        this.games.push(game);
    }

    updateGameStatus(id : string, status: GameStatus){
        for(let game of this.games){
            if(game.roomCode === id) game.status = status;
        }
    }

    isPlayerInTournament(playerId : string): boolean{
        for(let player of this.players){
            if(player.socket.id === playerId) return true;
        }
        return false;
    }

    getGameData(): GameData[]{
        return this.games;
    }

    getGameRooms(): string[]{
        return this.rooms;
    }

    startTournament(gameCreationCallback : (tid : string, users: io.Socket[]) => string[], gameStartCallback : (tid : string, users: io.Socket[], rooms: string[]) => void, gameEndCallback: (tid : string) => void){
        let users : io.Socket[] = [];
        for(let player of this.players){
            users.push(player.socket);
        }
        this.rooms = gameCreationCallback(this.id, users);
        setTimeout(() => {
            gameStartCallback(this.id, users, this.rooms);
            this.startRoundTimer();
        }, TOURNAMENT_ROUND_START_TIMER);
    }

    setGameWinner(id : string, winnerName : string){
        let numberFinished = 0;
        for(let game of this.games){
            if(game.roomCode !== id){
                if(game.status === GameStatus.FINISHED) numberFinished++;
                continue;
            }
            numberFinished++;
            let loserName = '';
            game.status = GameStatus.FINISHED;
            for(let i = 0; i < game.players.length; i++){
                if(game.players[i] === winnerName){
                    game.winnerIndex = i;
                }else{
                    loserName = game.players[i];
                }
            }
            if(game.type.includes('Semi')){
                const final1 = this.getGame('Final1');
                if(final1){
                    final1.players.push(winnerName);
                }else{
                    this.games.push({type : 'Final1', status : GameStatus.PENDING, players : [winnerName], winnerIndex: 0, roomCode : ''});
                }
                const final2 = this.getGame('Final2');
                if(final2){
                    final2.players.push(loserName);
                }else{
                    this.games.push({type : 'Final2', status : GameStatus.PENDING, players : [loserName], winnerIndex: 0, roomCode : ''});
                }
            }
        }
        if(numberFinished === 2){
            clearInterval(this.roundTimer);
            // TODO Start next round
        }
    }

    private getGame(type: string): GameData | null{
        for(let game of this.games){
            if(game.type === type) return game;
        }
        return null;
    }

    private startRoundTimer(){
        let nbMinLeft = TOURNAMENT_ROUND_LENGTH;
        this.roundTimer = setInterval(() => {
            nbMinLeft--;
            if(nbMinLeft <= 0){
                clearInterval(this.roundTimer);
            }
        }, MILLISECOND_IN_MINUTES);
    }
}