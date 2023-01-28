import { expect } from 'chai';
import { describe } from 'mocha';
import { Letter } from './letter';
import { Multiplier, Tile } from './tile';
describe('Tile', () => {
    let letter: Letter;
    let tile: Tile;

    beforeEach(() => {
        letter = new Letter('a', 1);
        tile = new Tile(Multiplier.Normal);
    });
    it('should  return false if there is not a letter in the tile', () => {
        expect(tile.hasLetter()).to.equal(false);
    });
    it('should  return a string of the tile multiplier when toString is called', () => {
        expect(tile.toString()).to.equal('0');
    });
    it('should add a letter when placeLetter is called and remove it when removeLetter is called', () => {
        tile.placeLetter(letter);
        expect(tile.hasLetter()).to.equal(true);
        expect(tile.getLetter()).to.equal(letter);
        tile.removeLetter();
        expect(tile.hasLetter()).to.equal(false);
        expect(tile.getLetter()).to.equal(undefined);
    });
});
