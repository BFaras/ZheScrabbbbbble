import { GameRoom } from '@app/classes/game-room';
import { Player } from '@app/classes/player';
import { Timer } from '@app/constants/basic-interface';
import { Dictionary } from '@app/constants/database-interfaces';
import * as fs from 'fs';
import { Service } from 'typedi';
import { WordValidation } from './word-validation.service';
import crypto = require('crypto');

export interface WaitingRoom {
    hostName: string;
    roomName: string;
    timer: Timer;
}

@Service()
export class RoomManagerService {
    private activeRooms: { [key: string]: GameRoom } = {};
    private defaultWordValidationService: WordValidation;
    constructor(dictionary: Dictionary | undefined) {
        if (!dictionary?.words) dictionary = JSON.parse(fs.readFileSync('./assets/dictionnary.json', 'utf8')) as Dictionary;
        if (!dictionary?.words) dictionary.words = [];
        this.defaultWordValidationService = new WordValidation(dictionary.words);
    }

    createRoom(roomName: string, words: string[] | undefined): string {
        const id = 'room-' + roomName + '-' + crypto.randomBytes(10).toString('hex');
        this.activeRooms[roomName] = new GameRoom(id, roomName, words ? new WordValidation(words) : this.defaultWordValidationService);
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

    /*
    getWaitingRooms(): WaitingRoom[] {
        const waitingRooms: WaitingRoom[] = [];
        for (const room of Object.values(this.activeRooms)) {
            if (room.getPlayerCount() === 1 && !room.getGame.isGameOver()) {
                waitingRooms.push({
                    roomName: room.getName(),
                    hostName: room.getPlayerFromIndex(0).getName(),
                    timer: room.getTimeChosen(),
                });
            }
        }
        return waitingRooms;
    }
    */

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
