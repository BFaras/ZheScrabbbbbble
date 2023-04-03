import { MAX_NUMBER_OF_PLAYERS, RoomVisibility } from "@app/constants/basic-constants";
import { CommandResult } from "@app/controllers/command.controller";
import { CoopPlayer } from "./coop-player";
import { GameRoom } from "./game-room";
import { Player } from "./player";

export class CoopGameRoom extends GameRoom {
    coopPlayers: CoopPlayer[] = [];
    pendingAction: { command: string, argument: string } | null = null;
    acceptedList: number[] = [];

    constructor(id: string, name: string, visibility: RoomVisibility, password?: string) {
        super(id, name, visibility, password, false);
    }

    addPlayer(player: Player): void {
        if (this.coopPlayers.length < MAX_NUMBER_OF_PLAYERS) {
            this.coopPlayers.push(player.toCoopPlayer());
        }
    }

    removePlayer(playerID: string): boolean {
        let index = -1;
        for (let i = 0; i < this.coopPlayers.length; i++) {
            if (this.coopPlayers[i].getUUID() === playerID) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            this.coopPlayers.splice(index, 1);
            return true;
        }
        index = this.observers.indexOf(playerID);
        if (index < 0) return false;
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
        if (includeObservers) count += this.observers.length;
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

    startGame(timerCallback: (room: GameRoom, username: string, result: CommandResult) => void) {
        if (this.gameStarted) return;
        this.players.push(new Player());
        super.startGame(timerCallback);
    }

    hasPendingAction(): boolean {
        return this.pendingAction !== null;
    }

    setPendingAction(action: { command: string, argument: string }) {
        this.pendingAction = action;
    }

    getPendingAction(): { command: string, argument: string } | null {
        return this.pendingAction;
    }

    resetPendingAction() {
        this.acceptedList = [];
        this.pendingAction = null;
    }

    missingNumberApprovals(): number {
        return this.coopPlayers.length - this.acceptedList.length;
    }

    acceptAction(playerID: string): boolean {
        for (let i = 0; i < this.coopPlayers.length; i++) {
            if (this.coopPlayers[i].getUUID() === playerID) {
                if (!this.acceptedList.includes(i)) {
                    this.acceptedList.push(i);
                }
                return this.missingNumberApprovals() === 0;
            }
        }
        return false;
    }

    refuseAction(playerID: string): boolean {
        for (let i = 0; i < this.coopPlayers.length; i++) {
            if (this.coopPlayers[i].getUUID() === playerID) {
                if (!this.acceptedList.includes(i)) {
                    this.acceptedList = [];
                    this.pendingAction = null;
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    private getCoopPlayer(playerID: string): CoopPlayer | null {
        for (const player of this.coopPlayers) {
            if (player.getUUID() === playerID) return player;
        }
        return null;
    }
}