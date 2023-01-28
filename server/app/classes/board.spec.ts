/* eslint-disable @typescript-eslint/no-magic-numbers */
import { LetterPosition } from '@app/constants/basic-interface';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Board } from './board';
import { Letter } from './letter';

describe('Board', () => {
    let board: Board;
    let lettersPosition: LetterPosition[];
    let letterA: Letter;
    let letterB: Letter;
    beforeEach(async () => {
        board = new Board();
        letterA = new Letter('a', 1);
        letterB = new Letter('b', 1);
        lettersPosition = [
            { letter: letterA, x: 0, y: -1 },
            { letter: letterB, x: 1, y: 1 },
        ];
    });

    it('should create a board containing multiplier tiles based on default values', () => {
        expect(board.convertToString()).to.equal(
            '4,0,0,1,0,0,0,4,0,0,0,1,0,0,4\n' +
                '0,2,0,0,0,3,0,0,0,3,0,0,0,2,0\n' +
                '0,0,2,0,0,0,1,0,1,0,0,0,2,0,0\n' +
                '1,0,0,2,0,0,0,1,0,0,0,2,0,0,1\n' +
                '0,0,0,0,2,0,0,0,0,0,2,0,0,0,0\n' +
                '0,3,0,0,0,3,0,0,0,3,0,0,0,3,0\n' +
                '0,0,1,0,0,0,1,0,1,0,0,0,1,0,0\n' +
                '4,0,0,1,0,0,0,2,0,0,0,1,0,0,4\n' +
                '0,0,1,0,0,0,1,0,1,0,0,0,1,0,0\n' +
                '0,3,0,0,0,3,0,0,0,3,0,0,0,3,0\n' +
                '0,0,0,0,2,0,0,0,0,0,2,0,0,0,0\n' +
                '1,0,0,2,0,0,0,1,0,0,0,2,0,0,1\n' +
                '0,0,2,0,0,0,1,0,1,0,0,0,2,0,0\n' +
                '0,2,0,0,0,3,0,0,0,3,0,0,0,2,0\n' +
                '4,0,0,1,0,0,0,4,0,0,0,1,0,0,4\n',
        );
    });

    it('should return an array containing every letter when calling toStringArray', () => {
        board.getTile(0, 0)?.placeLetter(letterA);
        board.getTile(1, 0)?.placeLetter(letterB);
        board.getTile(0, 1)?.placeLetter(new Letter('c', 0));
        const returnedArray = board.toStringArray();
        expect(returnedArray[0][0]).to.equal('a');
        expect(returnedArray[1][0]).to.equal('b');
        expect(returnedArray[0][1]).to.equal('blankc');
        expect(returnedArray[14][14]).to.equal('');
    });
    it('should return null when getting Tiles outside the board', () => {
        expect(board.getTile(-1, 1)).to.equal(null);
        expect(board.getTile(14, 16)).to.equal(null);
    });
    it('should add when addLetters called and then remove whn removeLetters is called', () => {
        board.placeLetters(lettersPosition);
        expect(board.getTile(0, -1)?.getLetter()).to.equal(undefined);
        expect(board.getTile(1, 1)?.getLetter()).to.equal(letterB);
        board.removeLetters(lettersPosition);
        expect(board.getTile(0, -1)?.getLetter()).to.equal(undefined);
        expect(board.getTile(1, 1)?.getLetter()).to.equal(undefined);
    });
});
