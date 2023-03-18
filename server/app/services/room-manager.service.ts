import { GameRoom } from '@app/classes/game-room';
import { Player } from '@app/classes/player';
import { MAX_NUMBER_OF_PLAYERS, RoomVisibility } from '@app/constants/basic-constants';
import { GameRoomInfo } from '@app/constants/basic-interface';
import crypto = require('crypto');
import { Service } from 'typedi';

@Service()
export class RoomManagerService {
    private activeRooms: { [key: string]: GameRoom } = {};

    createRoom(roomName: string, visibility: RoomVisibility, password?: string): string {
        const id = 'room-' + roomName + '-' + crypto.randomBytes(10).toString('hex');
        this.activeRooms[id] = new GameRoom(id, roomName, visibility, password);
        return id;
    }

    addPlayer(id: string, player: Player, password?: string): boolean {
        if(!this.activeRooms[id].verifyPassword(password)) return false;
        this.activeRooms[id]?.addPlayer(player);
        return true;
    }

    removePlayer(id: string, playerID: string) {
        this.activeRooms[id].removePlayer(playerID);
        if (this.activeRooms[id].getPlayerCount() === 0) {
            delete this.activeRooms[id];
        }
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
            if (!room.getGame.isGameOver()) {
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

    deleteRoom(id: string): void {
        delete this.activeRooms[id];
    }
}
