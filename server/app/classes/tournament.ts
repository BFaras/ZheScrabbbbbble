import * as io from 'socket.io';

export const MAX_TOURNAMENT_CODE = 100000;

export enum GameStatus{
    PENDING,
    IN_PROGRESS,
    FINISHED
}

export interface GameData {
    type : string;
    status : GameStatus;
    players : string[];
    roomCode : string;
}

export class Tournament{
    private static tournamentCode : number = 0;
    private players : {socket : io.Socket, username: string, wins: number}[];
    private id : string;
    private games : GameData[] = [];

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

    getGameData(): GameData[]{
        return this.games;
    }
}