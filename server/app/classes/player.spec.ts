/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { FIVE_ROUND, SWAP_FIFTEEN_LETTERS } from '@app/constants/goal-constants';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Hand } from './hand';
import { Letter } from './letter';
import { Player } from './player';

describe('Player', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player('id1', 'Joe');
    });
    it('a new player should not have the turn', () => {
        expect(player.hasTurn()).to.equals(false);
    });
    it('a new player should have the turn after the swap', () => {
        player.swapTurn();
        expect(player.hasTurn()).to.equals(true);
    });
    it('a new player should lose the turn after another swap', () => {
        player.swapTurn();
        player.swapTurn();
        expect(player.hasTurn()).to.equals(false);
    });
    it('adding 5 to the score should return a score of 5', () => {
        player.addScore(5);
        expect(player.getScore()).to.equals(5);
    });
    it('setGoal should change the property goal ', () => {
        const goalsList = [SWAP_FIFTEEN_LETTERS, FIVE_ROUND];
        player.setGoals(goalsList);
        expect(player['goals']).to.eql(goalsList);
    });
    it('getGoals should return the goals of the players ', () => {
        const goalsList = [SWAP_FIFTEEN_LETTERS, FIVE_ROUND];
        player['goals'] = goalsList;
        expect(player.getGoals()).to.eql(goalsList);
    });
    it('getNumberOfSwap should return numberOfSwap  ', () => {
        player['numberOfSwap'] = 5;
        expect(player.getNumberOfSwap()).to.equals(5);
    });
    it('getNumberOfPlacementSucc should return numberOfPlacementSucc', () => {
        player['numberOfPlacementSucc'] = 9;
        expect(player.getNumberOfPlacementSucc()).to.equals(9);
    });
    it('incrementNumberOfSwap should increment numberOfSwap ', () => {
        const oldNummber = player.getNumberOfSwap();
        player.addNumberOfSwap(1);
        const newNumber = player.getNumberOfSwap();
        expect(newNumber - oldNummber).to.equals(1);
    });
    it('incrementNumberOfPlacementSucc should increment numberOfPlacementSucc ', () => {
        const oldNummber = player.getNumberOfPlacementSucc();
        player.incrementNumberOfPlacementSucc();
        const newNumber = player.getNumberOfPlacementSucc();
        expect(newNumber - oldNummber).to.equals(1);
    });
    it('resetNumberOfSwap should reset numberOfSwap ', () => {
        player['numberOfSwap'] = 5;
        player.resetNumberOfSwap();
        expect(player['numberOfSwap']).to.equals(0);
    });
    it('resetNumberOfPlacementSucc should reset numberOfPlacementSucc', () => {
        player['numberOfPlacementSucc'] = 7;
        player.resetNumberOfPlacementSucc();
        expect(player['numberOfPlacementSucc']).to.equals(0);
    });
    it('should copy attributes when copyPlayerState is called', () => {
        const hand: Hand = new Hand([new Letter('a', 0), new Letter('z', 100)]);
        player['hand'] = hand;
        player['score'] = 382;
        player['playerHasTurn'] = true;
        const newPlayer: Player = new Player('id2', 'Manuel');
        newPlayer.copyPlayerState(player);
        expect(newPlayer.getHand()).to.eql(hand);
        expect(newPlayer.getScore()).to.equals(382);
        expect(newPlayer.hasTurn()).to.equals(true);
        expect(newPlayer.getGoals()).to.equals(undefined);
    });
});
