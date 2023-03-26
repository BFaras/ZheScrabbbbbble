import { GameRoom } from '@app/classes/game-room';
import { Player } from '@app/classes/player';
import { MAX_NUMBER_OF_PLAYERS, RoomVisibility } from '@app/constants/basic-constants';
import { GameRoomInfo } from '@app/constants/basic-interface';
import { ROOM_ID_BEGINNING } from '@app/constants/room-constants';
import Container, { Service } from 'typedi';
import { ChatGameHistoryService } from './chat-game-history.service';
import crypto = require('crypto');

@Service()
export class RoomManagerService {
    private chatGameHistoryService: ChatGameHistoryService;
    private activeRooms: { [key: string]: GameRoom };

    constructor() {
        this.activeRooms = {};
        this.chatGameHistoryService = Container.get(ChatGameHistoryService);
    }

    createRoom(roomName: string, visibility: RoomVisibility, password?: string): string {
        const id = ROOM_ID_BEGINNING + roomName + '-' + crypto.randomBytes(10).toString('hex');
        this.activeRooms[id] = new GameRoom(id, roomName, visibility, password);
        return id;
    }

    addPlayer(id: string, player: Player) {
        this.activeRooms[id]?.addPlayer(player);
    }

    addObserver(id: string, playerId: string) {
        this.activeRooms[id]?.addObserver(playerId);
    }

    verifyPassword(id: string, password?: string): boolean {
        return this.activeRooms[id].verifyPassword(password);
    }

    verifyIfRoomExists(roomName: string): boolean {
        for (const room of Object.values(this.activeRooms)) {
            if (room.getName() === roomName) return true;
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
                    isStarted: room.isGameStarted(),
                });
            }
        }
        return gameRooms;
    }

    isRoomFull(id: string): boolean {
        return this.activeRooms[id].getPlayerCount() >= MAX_NUMBER_OF_PLAYERS;
    }

    getRoomPlayerNames(id: string): string[] {
        return this.activeRooms[id].getPlayerNames();
    }

    getRoomVisibility(id: string): RoomVisibility {
        return this.activeRooms[id].getVisibility();
    }

    getRoomHost(id: string): Player {
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
        this.chatGameHistoryService.removeGameChatHistory(id);
    }
}
