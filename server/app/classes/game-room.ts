import { Player } from '@app/classes/player';
import { MAX_NUMBER_OF_PLAYERS } from '@app/constants/basic-constants';
import { Timer } from '@app/constants/basic-interface';
import { WordValidation } from '@app/services/word-validation.service';
import { Game } from './game';
import { GameSettings } from './game-settings';
import { VirtualPlayer } from './virtual-player';
import { VirtualPlayerEasy } from './virtual-player-easy';

export class GameRoom {
    private players: Player[];
    private name: string;
    private connectedPlayers: number;
    private timer: Timer;
    private isSoloGame: boolean;
    private game: Game;

    constructor(name: string, wordValidationService: WordValidation, gameSettings: GameSettings) {
        this.name = name;
        this.players = [];
        this.connectedPlayers = 0;
        this.isSoloGame = gameSettings.isSoloMode;
        this.timer = gameSettings.timer;
        this.game = new Game(wordValidationService, this.players);
    }

    addPlayer(player: Player) {
        if (this.players.length < MAX_NUMBER_OF_PLAYERS) {
            this.players.push(player);
        }
    }
    convertSoloGame(playerID: string, virtualPlayer: VirtualPlayerEasy) {
        if (!this.getPlayer(playerID, false)) return;
        const index: number = this.getPlayer(playerID, false) === this.players[0] ? 0 : 1;
        virtualPlayer.copyPlayerState(this.players[index]);
        this.players[index] = virtualPlayer;
        this.isSoloGame = true;
        this.game.convertSoloGame();
    }

    removePlayer(playerID: string): boolean {
        const player = this.getPlayer(playerID, false);
        if (!player) {
            return false;
        }
        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
        return true;
    }

    removeVirtualPlayers() {
        if (this.players[1] instanceof VirtualPlayer) this.players.splice(1, 1);
        if (this.players[0] instanceof VirtualPlayer) this.players.splice(0, 1);
    }

    isPlayerInRoom(playerID: string): boolean {
        return this.getPlayer(playerID, false) !== null;
    }

    isPlayerTurn(playerID: string): boolean {
        const player = this.getPlayer(playerID, false);
        return player ? player.hasTurn() : false;
    }

    getPlayerCount(): number {
        return this.players.length;
    }

    getName(): string {
        return this.name;
    }

    getIsSoloGame(): boolean {
        return this.isSoloGame;
    }

    getPlayer(playerID: string, otherPlayer: boolean): Player | null {
        for (const player of this.players) {
            if ((player.getUUID() === playerID) !== otherPlayer) {
                return player;
            }
        }
        return null;
    }

    getPlayerFromIndex(playerIndex: number): Player {
        return this.players[playerIndex];
    }

    getPlayerIndex(active: boolean): number {
        if (active) {
            return this.players[0].hasTurn() ? 0 : 1;
        }
        return this.players[0].hasTurn() ? 1 : 0;
    }

    incrementConnectedPlayers(): boolean {
        this.connectedPlayers++;
        return this.connectedPlayers === 2;
    }

    getTimeChosen(): Timer {
        return this.timer;
    }

    get getGame(): Game {
        return this.game;
    }
}
