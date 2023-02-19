import { Hand } from '@app/classes/hand';
import { Service } from 'typedi';

@Service()
export class Player {
    private uuid: string;
    private hand: Hand;
    private name: string;
    private score: number;

    constructor(uuid: string, name: string) {
        this.uuid = uuid;
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
    addScore(turnScore: number) {
        this.score += turnScore;
    }
}
