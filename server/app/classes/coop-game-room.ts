import { MAX_NUMBER_OF_PLAYERS, RoomVisibility } from "@app/constants/basic-constants";
import { CommandResult } from "@app/controllers/command.controller";
import { CoopPlayer } from "./coop-player";
import { GameRoom } from "./game-room";
import { Player } from "./player";

export class CoopGameRoom extends GameRoom {
    coopPlayers : CoopPlayer[] = [];

    constructor(id: string, name: string, visibility: RoomVisibility, password?: string) {
        super(id, name, visibility, password);
    }

    addPlayer(player: Player): void {
        if (this.coopPlayers.length < MAX_NUMBER_OF_PLAYERS) {
            this.coopPlayers.push(player.toCoopPlayer());
        }
    }

    removePlayer(playerID: string): boolean {
        let index = -1;
        for(let i= 0; i < this.coopPlayers.length; i++){
            if(this.coopPlayers[i].getUUID() === playerID){
                index = i;
                break;
            }
        }
        if (index >= 0) {
            this.coopPlayers.splice(index, 1);
            return true;
        }
        index = this.observers.indexOf(playerID);
        if(index < 0) return false;
        this.observers.splice(index, 1);
        return false;
    }

    replacePlayer(playerID: string): void {}

    isPlayerInRoom(playerID: string): boolean {
        return this.getCoopPlayer(playerID) !== null || this.observers.includes(playerID);
    }

    getPlayerCount(): number {
        return this.coopPlayers.length;
    }

    getRealPlayerCount(includeObservers: boolean): number {
        let count = this.coopPlayers.length;
        if(includeObservers) count += this.observers.length;
        return count;
    }

    getHostPlayer(): Player {
        return this.coopPlayers[0].toPlayer();
    }

    getPlayerFromIndex(playerIndex: number): Player {
        return this.coopPlayers[playerIndex].toPlayer();
    }

    getPlayerNames(): string[] {
        const names = [];
        for (const player of this.coopPlayers) {
            names.push(player.getName());
        }
        return names;
    }

    startGame(timerCallback : (room : GameRoom, username: string, result : CommandResult) => void) {
        if(this.gameStarted) return;
        this.players.push(new Player());
        super.startGame(timerCallback);
    }

    private getCoopPlayer(playerID: string): CoopPlayer | null{
        for(const player of this.coopPlayers){
            if(player.getUUID() === playerID) return player;
        }
        return null;
    }
}