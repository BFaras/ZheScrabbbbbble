/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { describe } from 'mocha';
import { Hand } from './hand';
import { Letter } from './letter';

describe('Hand', () => {
    let hand: Hand;
    let letters: Letter[];

    it('should return letters when getLetter is called with valid letters', () => {
        const letterA = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        const letterC = new Letter('c', 0);
        letters = [letterA, letterB, letterC];
        hand = new Hand(letters);
        const queryResult = hand.getLetters('ac', true);
        expect(queryResult).to.contain(letterA);
        expect(queryResult).to.not.contain(letterB);
        expect(queryResult).to.contain(letterC);
    });

    it('should return blank tile when getLetter is called with capital letter', () => {
        const letterA = new Letter('a', 0);
        const letterBlank = new Letter('blank', 0);
        const letterC = new Letter('c', 0);
        letters = [letterA, letterBlank];
        hand = new Hand(letters);
        const queryResult = hand.getLetters('aC', true);
        expect(queryResult).to.contain(letterA);
        expect(queryResult).to.contain(letterBlank);
        expect(queryResult).to.not.contain(letterC);
    });

    it('should return blank tile when getLetter is called with * character', () => {
        const letterA = new Letter('a', 0);
        const letterBlank = new Letter('blank', 0);
        const letterC = new Letter('c', 0);
        letters = [letterA, letterBlank];
        hand = new Hand(letters);
        const queryResult = hand.getLetters('a*', true);
        expect(queryResult).to.contain(letterA);
        expect(queryResult).to.contain(letterBlank);
        expect(queryResult).to.not.contain(letterC);
    });

    it('should return different instances of letter when getLetter is called with the same letters', () => {
        const letterA1 = new Letter('a', 0);
        const letterA2 = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        letters = [letterA1, letterA2, letterB];
        hand = new Hand(letters);
        const queryResult = hand.getLetters('aa', true);
        expect(queryResult).to.contain(letterA1);
        expect(queryResult).to.contain(letterA2);
        expect(queryResult).to.not.contain(letterB);
    });

    it('should return null when getLetter is called and the letter is not in the hand', () => {
        const letterA = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        const letterC = new Letter('c', 0);
        letters = [letterA, letterB, letterC];
        hand = new Hand(letters);
        const queryResult = hand.getLetters('ad', true);
        expect(queryResult).to.be.null;
    });

    it('should only return 1 letter when getLetter is called if there is 2 times the same letter in the hand', () => {
        const letterA1 = new Letter('a', 0);
        const letterA2 = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        letters = [letterA1, letterA2, letterB];
        hand = new Hand(letters);
        const queryResult = hand.getLetters('ab', true);
        expect(queryResult).to.contain(letterA1);
        expect(queryResult).to.not.contain(letterA2);
        expect(queryResult).to.contain(letterB);
    });
    it('should add a letter when  addLetters() is called', () => {
        const letterA = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        hand = new Hand([letterA, letterB]);
        const letterC = new Letter('c', 0);
        hand.addLetters([letterC]);
        expect(hand['letters']).to.contain(letterC);
    });
    it('should not return 2 when getLength() is called', () => {
        const letterA = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        hand = new Hand([letterA, letterB]);
        expect(hand.getLength()).to.equals(2);
    });
    it('should return 0 when getLength() is called on an empty hand', () => {
        hand = new Hand([]);
        expect(hand.getLength()).to.equals(0);
    });
    it('should have the correct length when cutDownToSize is called', () => {
        const letterA = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        hand = new Hand([letterA, letterB, letterA, letterB, letterA, letterB]);
        expect(hand.getLength()).to.equals(6);
        hand.cutDownToSize(6);
        expect(hand.getLength()).to.equals(6);
        hand.cutDownToSize(5);
        expect(hand.getLength()).to.equals(5);
        hand.cutDownToSize(4);
        expect(hand.getLength()).to.equals(4);
        hand.cutDownToSize(3);
        expect(hand.getLength()).to.equals(3);
        hand.cutDownToSize(2);
        expect(hand.getLength()).to.equals(2);
        hand.cutDownToSize(0);
        expect(hand.getLength()).to.equals(0);
    });
    it('should return an array with the char of each letter', () => {
        const letterA1 = new Letter('a', 0);
        const letterA2 = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        letters = [letterA1, letterA2, letterB];
        hand = new Hand(letters);
        expect(hand.getLettersToString()).to.eql([letterA1.getChar(), letterA2.getChar(), letterB.getChar()]);
    });
    it('should return the sum of the value of the letters in hand when calculateHand is called', () => {
        const letterA1 = new Letter('a', 18);
        const letterA2 = new Letter('a', 32);
        const letterB = new Letter('b', 57);
        letters = [letterA1, letterA2, letterB];
        hand = new Hand(letters);
        expect(hand.calculateHandScore()).to.equals(107);
    });
    it('should return 0 when calculateHand is called on an empty hand', () => {
        hand = new Hand([]);
        expect(hand.calculateHandScore()).to.equals(0);
    });

    it('should remove letters from hand when getLetters is called', () => {
        const letterA = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        const letterC = new Letter('c', 0);
        letters = [letterA, letterB, letterC];
        hand = new Hand(letters);
        hand.getLetters('ab', true);
        expect(hand['letters']).to.not.contain(letterA);
        expect(hand['letters']).to.not.contain(letterB);
        expect(hand['letters']).to.contain(letterC);
    });

    it('should not remove letters from hand when getLetters is called but returns null', () => {
        const letterA = new Letter('a', 0);
        const letterB = new Letter('b', 0);
        const letterC = new Letter('c', 0);
        letters = [letterA, letterB, letterC];
        hand = new Hand(letters);
        hand.getLetters('abd', true);
        expect(hand['letters']).to.contain(letterA);
        expect(hand['letters']).to.contain(letterB);
        expect(hand['letters']).to.contain(letterC);
    });
});
