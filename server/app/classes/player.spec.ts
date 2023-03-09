/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
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
    it('adding 5 to the score should return a score of 5', () => {
        player.addScore(5);
        expect(player.getScore()).to.equals(5);
    });
    it('should copy attributes when copyPlayerState is called', () => {
        const hand: Hand = new Hand([new Letter('a', 0), new Letter('z', 100)]);
        player['hand'] = hand;
        player['score'] = 382;
        const newPlayer: Player = new Player('id2', 'Manuel');
        newPlayer.copyPlayerState(player);
        expect(newPlayer.getHand()).to.eql(hand);
        expect(newPlayer.getScore()).to.equals(382);
    });
});
