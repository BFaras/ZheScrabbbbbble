import { Player } from '@app/classes/player';
import { MAX_NUMBER_OF_PLAYERS, RoomVisibility } from '@app/constants/basic-constants';
import { Game } from './game';
import { VirtualPlayer } from './virtual-player';
import { VirtualPlayerEasy } from './virtual-player-easy';

export class GameRoom {
    private players: Player[];
    private id: string;
    private name: string;
    private connectedPlayers: number;
    private game: Game;
    private visibility: RoomVisibility;
    private password: string;
    private gameStarted: boolean;

    constructor(id: string, name: string, visibility: RoomVisibility, password?: string) {
        this.id = id;
        this.name = name;
        this.players = [];
        this.connectedPlayers = 0;
        this.visibility = visibility;
        if (visibility === RoomVisibility.Protected) {
            if(!password){
                this.visibility = RoomVisibility.Public
            }else{
                this.password = password;
            } 
        }
        this.game = new Game(this.players);
        this.gameStarted = false;
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

    replacePlayer(playerID: string) {
        let index = -1;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].getUUID() === playerID) {
                index = i;
                break;
            }
        }
        if(index === -1) return;
        if(this.players[index] instanceof VirtualPlayer) return;
        const newVirtualPlayer = new VirtualPlayerEasy(this.players[index].getName() + " (V)", this);
        this.players[index] = newVirtualPlayer;
    }

    isPlayerInRoom(playerID: string): boolean {
        return this.getPlayer(playerID) !== null;
    }

    getPlayerCount(): number {
        return this.players.length;
    }

    getRealPlayerCount(): number {
        let count = 0; 
        for(const player of this.players){
            if(!(player instanceof VirtualPlayer)) count++;
        }
        return count;
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

    getHostPlayer(): Player {
        return this.players[0];
    }

    getPlayerFromIndex(playerIndex: number): Player {
        return this.players[playerIndex];
    }

    incrementConnectedPlayers(): boolean {
        this.connectedPlayers++;
        return this.connectedPlayers >= MAX_NUMBER_OF_PLAYERS;
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
        if(!this.password) return true;
        return this.password === password;
    }

    startGame() {
        if(this.gameStarted) return;
        this.game.startGame();
        this.gameStarted = true;
    }

    isGameStarted(){
        return this.gameStarted;
    }

    get getGame(): Game {
        return this.game;
    }
}
