import { GameRoom } from '@app/classes/game-room';
import { GameSettings } from '@app/classes/game-settings';
import { Player } from '@app/classes/player';
import { Timer } from '@app/constants/basic-interface';
import { Dictionary } from '@app/constants/database-interfaces';
import * as fs from 'fs';
import { Service } from 'typedi';
import { WordValidation } from './word-validation.service';

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

    createSoloRoomName(): string {
        const soloRooms = [''];
        for (const room of Object.values(this.activeRooms)) {
            if (room.getIsSoloGame()) {
                soloRooms.push(room.getName());
            }
        }
        let i = 1;
        while (soloRooms.includes('solo'.concat(`${i}`))) {
            i++;
        }
        return 'solo'.concat(`${i}`);
    }

    createRoom(gameSettings: GameSettings, words: string[] | undefined) {
        let roomName = '';
        if (gameSettings.roomName) roomName = gameSettings.roomName;
        this.activeRooms[roomName] = new GameRoom(roomName, words ? new WordValidation(words) : this.defaultWordValidationService, gameSettings);
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
