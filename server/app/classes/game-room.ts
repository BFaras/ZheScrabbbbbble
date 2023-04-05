import { Player } from '@app/classes/player';
import { MAX_NUMBER_OF_PLAYERS, RoomVisibility } from '@app/constants/basic-constants';
import { CommandResult } from '@app/controllers/command.controller';
import { Game } from './game';
import { VirtualPlayer } from './virtual-player';
import { VirtualPlayerEasy } from './virtual-player-easy';

export class GameRoom {
    private id: string;
    private name: string;
    private game: Game;
    private visibility: RoomVisibility;
    private password: string;

    protected gameStarted: boolean;
    protected players: Player[];
    protected observers: string[] = [];


    constructor(id: string, name: string, visibility: RoomVisibility, password?: string, timerEnabled: boolean = true) {
        this.id = id;
        this.name = name;
        this.players = [];
        this.visibility = visibility;
        if (visibility === RoomVisibility.Protected) {
            if (!password) {
                this.visibility = RoomVisibility.Public
            } else {
                this.password = password;
            }
        }
        this.game = new Game(this.players, timerEnabled);
        this.gameStarted = false;
    }

    isPlayerObserver(userId: string): boolean {
        return this.observers.includes(userId);
    }

    addObserver(userId: string) {
        this.observers.push(userId);
    }

    removeObserver(userId: string) {
        const index = this.observers.indexOf(userId);
        if (index < 0) return;
        this.observers.splice(index, 1);
    }

    addPlayer(player: Player) {
        if (this.players.length < MAX_NUMBER_OF_PLAYERS) {
            this.players.push(player);
        }
    }

    removePlayer(playerID: string): boolean {
        const player = this.getPlayer(playerID);
        if (player) {
            const index = this.players.indexOf(player);
            this.players.splice(index, 1);
            return true;
        }
        const index = this.observers.indexOf(playerID);
        if (index < 0) return false;
        this.observers.splice(index, 1);
        return false;
    }

    replacePlayer(playerID: string) {
        let index = -1;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].getUUID() === playerID) {
                index = i;
                break;
            }
        }
        if (index === -1) return;
        if (this.players[index] instanceof VirtualPlayer) return;
        const newVirtualPlayer = new VirtualPlayerEasy(this.players[index].getName() + " (V)", this);
        newVirtualPlayer.copyPlayerState(this.players[index]);
        this.players[index] = newVirtualPlayer;
    }

    isPlayerInRoom(playerID: string): boolean {
        return this.getPlayer(playerID) !== null || this.observers.includes(playerID);
    }

    getPlayerCount(): number {
        return this.players.length;
    }

    getRealPlayerCount(includeObservers: boolean): number {
        let count = 0;
        for (const player of this.players) {
            if (!(player instanceof VirtualPlayer)) count++;
        }
        if (includeObservers) count += this.observers.length;
        return count;
    }

    getObserverCount(): number {
        return this.observers.length;
    }

    getName(): string {
        return this.name;
    }

    getHostPlayer(): Player {
        return this.players[0];
    }

    getPlayerFromIndex(playerIndex: number): Player {
        return this.players[playerIndex];
    }

    getID(): string {
        return this.id;
    }

    getVisibility(): RoomVisibility {
        return this.visibility;
    }

    getPlayerNames(): string[] {
        const names = [];
        for (const player of this.players) {
            names.push(player.getName());
        }
        return names;
    }

    verifyPassword(password?: string): boolean {
        if (!this.password) return true;
        return this.password === password;
    }

    startGame(timerCallback: (room: GameRoom, username: string, result: CommandResult) => void) {
        if (this.gameStarted) return;
        this.game.startGame((username: string, result: CommandResult) => {
            timerCallback(this, username, result);
        });
        this.gameStarted = true;
    }

    isGameStarted() {
        return this.gameStarted;
    }

    get getGame(): Game {
        return this.game;
    }

    private getPlayer(playerID: string): Player | null {
        for (const player of this.players) {
            if (player.getUUID() === playerID) {
                return player;
            }
        }
        return null;
    }
}
