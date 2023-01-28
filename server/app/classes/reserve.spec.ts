/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { LETTERS } from '@app/constants/default-reserve-content';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Letter } from './letter';
import { Reserve } from './reserve';

describe('Reserve', () => {
    let reserve: Reserve;

    beforeEach(() => {
        reserve = new Reserve();
    });

    it('should create a reserve containing 102 letters', () => {
        const RESERVE_SIZE = 102;

        expect(reserve['letters'].length).to.equals(RESERVE_SIZE);
    });
    it('should create a reserve containing letters with the right character and value combination', () => {
        reserve['letters'].forEach((letter) => {
            LETTERS.forEach((letterSource) => {
                if (letter.getChar() === letterSource[0]) expect(letter.getValue()).to.equals(letterSource[2]);
            });
        });
    });
    it('should create a reserve containing k letter once', () => {
        let nbK = 0;

        reserve['letters'].forEach((letter) => {
            if (letter.getChar() === 'k') nbK++;
        });
        expect(nbK).to.equals(LETTERS[10][1]);
    });
    it('should create a reserve containing A letter 9 time', () => {
        let nbA = 0;

        reserve['letters'].forEach((letter) => {
            if (letter.getChar() === 'a') nbA++;
        });
        expect(nbA).to.equals(LETTERS[0][1]);
    });
    it('should create a reserve containing  blank letters 2 time', () => {
        let nbBlank = 0;

        reserve['letters'].forEach((letter) => {
            if (letter.getChar() === 'blank') nbBlank++;
        });
        expect(nbBlank).to.equals(LETTERS[26][1]);
    });
    it('should draw 10 letters from the reserve when calling drawLetters(10)', () => {
        const nbDraw = 10;
        const drawnLetters = reserve.drawLetters(nbDraw);
        expect(drawnLetters.length).to.equals(nbDraw);
        expect(reserve['letters'].length).to.equals(102 - nbDraw);
    });
    it('should draw the entire available reserve when asked for more than the remaining number of letters when drawLetters is called', () => {
        const nbDraw = 250;
        const drawnLetters = reserve.drawLetters(nbDraw);
        expect(drawnLetters.length).to.equals(102);
        expect(reserve['letters'].length).to.equals(0);
    });
    it('should add an array of letters to the reserve when returnLetters is called', () => {
        const letter = new Letter('TEST', 100);
        reserve.returnLetters([letter]);
        expect(reserve['letters']).to.contains(letter);
    });
    it('should not return empty when isEmpty() is called on an non-empty reserve', () => {
        expect(reserve.isEmpty()).to.equals(false);
    });
    it('should return empty when isEmpty() is called on an empty reserve', () => {
        reserve.drawLetters(102);
        expect(reserve.isEmpty()).to.equals(true);
    });
    it('should return true when canSwap() is called on an full reserve', () => {
        expect(reserve.canSwap()).to.equals(true);
    });
    it('should return false when canSwap() is called on an empty reserve', () => {
        reserve.drawLetters(102);
        expect(reserve.canSwap()).to.equals(false);
    });
    it('should return true when canSwap() is called on a reserve with 10 letters remaining', () => {
        reserve.drawLetters(92);
        expect(reserve.canSwap()).to.equals(true);
    });
    it('should return a string with the quantity of each letter in the reserve when getReserveContent is called', () => {
        expect(reserve.getReserveContent().charAt(4)).to.equal('9');
        reserve['letters'] = [new Letter('a', 0)];
        expect(reserve.getReserveContent().charAt(4)).to.equal('1');
    });
});
