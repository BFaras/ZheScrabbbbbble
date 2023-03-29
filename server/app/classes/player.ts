import { Hand } from '@app/classes/hand';

export class Player {
    private uuid: string;
    private databaseId: string;
    private hand: Hand;
    private name: string;
    private score: number;

    constructor(uuid: string, databaseId: string, name: string) {
        this.uuid = uuid;
        this.databaseId = databaseId;
        this.name = name;
        this.score = 0;
        this.hand = new Hand([]);
    }

    copyPlayerState(player: Player) {
        this.score = player.getScore();
        this.hand = player.getHand();
    }

    getUUID(): string {
        return this.uuid;
    }

    setUUID(id: string) {
        this.uuid = id;
    }

    getHand(): Hand {
        return this.hand;
    }

    getName(): string {
        return this.name;
    }

    getScore(): number {
        return this.score;
    }

    getDatabaseId(): string {
        return this.databaseId;
    }

    addScore(turnScore: number) {
        this.score += turnScore;
    }
}
