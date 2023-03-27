import { GameRoom } from '@app/classes/game-room';
import { Player } from '@app/classes/player';
import { GameData, GameStatus, Tournament } from '@app/classes/tournament';
import { MAX_NUMBER_OF_PLAYERS, RoomVisibility } from '@app/constants/basic-constants';
import { GameRoomInfo } from '@app/constants/basic-interface';
import crypto = require('crypto');
import { Service } from 'typedi';
import * as io from 'socket.io';

@Service()
export class RoomManagerService {
    private activeRooms: { [key: string]: GameRoom } = {};
    private tournaments: { [key: string]: Tournament } = {};

    createRoom(roomName: string, visibility: RoomVisibility, password?: string): string {
        const id = 'room-' + roomName + '-' + crypto.randomBytes(10).toString('hex');
        this.activeRooms[id] = new GameRoom(id, roomName, visibility, password);
        return id;
    }

    addPlayer(id: string, player: Player) {
        this.activeRooms[id]?.addPlayer(player);
    }

    addObserver(id: string, playerId : string){
        this.activeRooms[id]?.addObserver(playerId);
    }

    verifyPassword(id: string, password?: string): boolean{
        return this.activeRooms[id].verifyPassword(password);
    }

    verifyIfRoomExists(roomName: string): boolean {
        for (const room of Object.values(this.activeRooms)) {
            if(room.getName() === roomName) return true;
        }
        return false;
    }

    getGameRooms(): GameRoomInfo[] {
        const gameRooms: GameRoomInfo[] = [];
        for (const room of Object.values(this.activeRooms)) {
            if (!room.getGame.isGameOver() && room.getVisibility() !== RoomVisibility.Tournament) {
                gameRooms.push({
                    name: room.getName(),
                    id: room.getID(),
                    visibility: room.getVisibility(),
                    players: room.getPlayerNames(),
                    isStarted: room.isGameStarted()
                });
            }
        }
        return gameRooms;
    }

    isRoomFull(id : string): boolean {
        return this.activeRooms[id].getPlayerCount() >= MAX_NUMBER_OF_PLAYERS;
    }

    getRoomPlayerNames(id: string): string[] {
        return this.activeRooms[id].getPlayerNames();
    }

    getRoomVisibility(id: string): RoomVisibility{
        return this.activeRooms[id].getVisibility();
    }

    getRoomHost(id: string): Player{
        return this.activeRooms[id].getHostPlayer();
    }

    findRoomFromPlayer(playerID: string): GameRoom | null {
        for (const room of Object.values(this.activeRooms)) {
            if (room.isPlayerInRoom(playerID)) {
                return room;
            }
        }
        return null;
    }

    getRoom(id: string): GameRoom{
        return this.activeRooms[id];
    }

    deleteRoom(id: string): void {
        delete this.activeRooms[id];
    }

    createTournament(players: {socket : io.Socket, username: string}[]): string{
        const tournament = new Tournament(players);
        const id = tournament.getID();
        this.tournaments[id] = tournament;
        return id;
    }

    registerTournamentGames(tid: string, id1 : string, id2: string){
        const tournament = this.tournaments[tid];
        const game1 = {type : 'Semi1', status : GameStatus.PENDING, players : this.activeRooms[id1].getPlayerNames(), winnerIndex: 0, roomCode : id1};
        const game2 = {type : 'Semi2', status : GameStatus.PENDING, players : this.activeRooms[id2].getPlayerNames(), winnerIndex: 0, roomCode : id2};
        tournament.registerGame(game1);
        tournament.registerGame(game2);
    }

    updateTournamentGameRoomCode(tid: string, rooms: string[]){
        this.tournaments[tid].updateGameRoomCodes(rooms);
    }

    updateTournamentGameStatus(tid: string, id: string, status: GameStatus){
        this.tournaments[tid].updateGameStatus(id, status);
    }

    getTournamentGameData(tid: string): GameData[]{
        return this.tournaments[tid].getGameData();
    }

    getTournamentTimeData(tid: string): {time: number, phase: number}{
        return this.tournaments[tid].getTimePhase();
    }

    startTournament(tid: string, gameCreationCallback : (tid : string, users: io.Socket[], round: number) => string[], gameStartCallback : (tid : string, rooms: string[]) => void, gameEndCallback : (tid : string) => void, timerMessageCallback: (tid : string, timeLeft : string) => void){
        this.tournaments[tid].startTournament(gameCreationCallback, gameStartCallback, gameEndCallback, timerMessageCallback);
    }

    findTournamentFromPlayer(username: string): Tournament | null {
        for (const tournament of Object.values(this.tournaments)) {
            if (tournament.isPlayerInTournament(username)) {
                return tournament;
            }
        }
        return null;
    }

    endTournamentGames(tid: string) : {room: GameRoom, endMessage: string}[]{
        const tournament = this.tournaments[tid]
        const rooms = tournament.getGameRooms();
        const endGameMessages : {room: GameRoom, endMessage: string}[] = [];
        for(let room of rooms){
            const gameRoom = this.activeRooms[room];
            if(!gameRoom) continue;
            if(gameRoom.getGame.isGameOver()) continue;
            endGameMessages.push({room: gameRoom, endMessage: gameRoom.getGame.endGame()});
            tournament.setGameWinner(room, gameRoom.getGame.getWinner());
        }
        return endGameMessages;
    }
}
