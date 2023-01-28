import { Hand } from '@app/classes/hand';
import { Goal } from '@app/constants/goal-constants';
import { Service } from 'typedi';

@Service()
export class Player {
    private uuid: string;
    private hand: Hand;
    private name: string;
    private score: number;
    private playerHasTurn: boolean;
    private numberOfSwap: number;
    private numberOfPlacementSucc: number;
    private goals?: Goal[];

    constructor(uuid: string, name: string) {
        this.uuid = uuid;
        this.name = name;
        this.score = 0;
        this.hand = new Hand([]);
        this.playerHasTurn = false;
        this.numberOfSwap = 0;
        this.numberOfPlacementSucc = 0;
    }
    copyPlayerState(player: Player) {
        this.score = player.getScore();
        this.playerHasTurn = player.hasTurn();
        this.hand = player.getHand();
        this.goals = player.getGoals();
    }

    setGoals(newGoals: Goal[]) {
        this.goals = newGoals;
    }
    getGoals(): Goal[] | undefined {
        return this.goals;
    }

    getNumberOfSwap(): number {
        return this.numberOfSwap;
    }

    getNumberOfPlacementSucc(): number {
        return this.numberOfPlacementSucc;
    }
    addNumberOfSwap(letterLength: number) {
        this.numberOfSwap += letterLength;
    }
    incrementNumberOfPlacementSucc() {
        this.numberOfPlacementSucc++;
    }

    resetNumberOfSwap() {
        this.numberOfSwap = 0;
    }

    resetNumberOfPlacementSucc() {
        this.numberOfPlacementSucc = 0;
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

    hasTurn(): boolean {
        return this.playerHasTurn;
    }
    swapTurn() {
        this.playerHasTurn = this.hasTurn() ? false : true;
    }
}
