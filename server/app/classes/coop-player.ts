import { Player } from "./player";

export class CoopPlayer {
    private uuid: string;
    private databaseId: string;
    private name: string;

    constructor(uuid: string, databaseId: string, name: string) {
        this.uuid = uuid;
        this.databaseId = databaseId;
        this.name = name;
    }

    toPlayer(): Player{
        return new Player(this.uuid, this.databaseId, this.name); 
    }

    getUUID(): string {
        return this.uuid;
    }

    getName(): string {
        return this.name;
    }

    getDatabaseId(): string {
        return this.databaseId;
    }
}