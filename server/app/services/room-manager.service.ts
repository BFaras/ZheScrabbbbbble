import { GameRoom } from '@app/classes/game-room';
import { Player } from '@app/classes/player';
import { RoomVisibility } from '@app/constants/basic-constants';
import { GameRoomInfo } from '@app/constants/basic-interface';
import crypto = require('crypto');

export class RoomManagerService {
    private activeRooms: { [key: string]: GameRoom } = {};

    createRoom(roomName: string, visibility: RoomVisibility, password?: string): string {
        const id = 'room-' + roomName + '-' + crypto.randomBytes(10).toString('hex');
        this.activeRooms[roomName] = new GameRoom(id, roomName, visibility, password);
        return id;
    }

    addPlayer(player: Player, roomName: string) {
        this.activeRooms[roomName]?.addPlayer(player);
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
            if (room.getPlayerCount() === 1 && !room.getGame.isGameOver()) {
                gameRooms.push({
                    roomName: room.getName(),
                    hostName: room.getPlayerFromIndex(0).getName(),
                    timer: room.getTimeChosen(),
                });
            }
        }
        return gameRooms;
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
