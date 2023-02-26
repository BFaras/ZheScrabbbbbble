import { GameRoom } from '@app/classes/game-room';
import { Player } from '@app/classes/player';
import { RoomVisibility } from '@app/constants/basic-constants';
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

    removePlayer(playerID: string, roomName: string) {
        this.activeRooms[roomName].removePlayer(playerID);
        if (this.activeRooms[roomName].getPlayerCount() === 0) {
            delete this.activeRooms[roomName];
        }
    }

    verifyIfRoomExists(roomName: string): boolean {
        return roomName in this.activeRooms;
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

    deleteRoom(roomToDelete: string): void {
        delete this.activeRooms[roomToDelete];
    }
}
