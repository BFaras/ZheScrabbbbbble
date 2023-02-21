import { Player } from '@app/classes/player';
import { MAX_NUMBER_OF_PLAYERS } from '@app/constants/basic-constants';
import { WordValidation } from '@app/services/word-validation.service';
import { Game } from './game';

export class GameRoom {
    private players: Player[];
    private id: string;
    private name: string;
    private connectedPlayers: number;
    private game: Game;

    constructor(id: string, name: string, wordValidationService: WordValidation) {
        this.id = id;
        this.name = name;
        this.players = [];
        this.connectedPlayers = 0;
        this.game = new Game(wordValidationService, this.players);
    }

    addPlayer(player: Player) {
        if (this.players.length < MAX_NUMBER_OF_PLAYERS) {
            this.players.push(player);
        }
    }

    removePlayer(playerID: string): boolean {
        const player = this.getPlayer(playerID);
        if (!player) {
            return false;
        }
        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
        return true;
    }

    isPlayerInRoom(playerID: string): boolean {
        return this.getPlayer(playerID) !== null;
    }

    getPlayerCount(): number {
        return this.players.length;
    }

    getName(): string {
        return this.name;
    }

    getPlayer(playerID: string): Player | null {
        for (const player of this.players) {
            if (player.getUUID() === playerID) {
                return player;
            }
        }
        return null;
    }

    getPlayerFromIndex(playerIndex: number): Player {
        return this.players[playerIndex];
    }

    incrementConnectedPlayers(): boolean {
        this.connectedPlayers++;
        return this.connectedPlayers === MAX_NUMBER_OF_PLAYERS;
    }

    getID(): string {
        return this.id;
    }

    get getGame(): Game {
        return this.game;
    }
}
