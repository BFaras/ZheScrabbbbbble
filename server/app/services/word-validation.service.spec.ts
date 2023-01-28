/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Board } from '@app/classes/board';
import { Letter } from '@app/classes/letter';
import { LetterPosition } from '@app/constants/basic-interface';
import { expect } from 'chai';
import { WordScore, WordValidation } from './word-validation.service';

describe('WordValidation', () => {
    let validationService: WordValidation;
    const dict: string[] = ['aime', 'trouver', 'vie', 'aiment'];
    let board: Board;
    const letterV = new Letter('v', 2);
    const letterI = new Letter('i', 3);
    const letterE = new Letter('e', 1);
    const letterA = new Letter('a', 2);
    const letterM = new Letter('m', 1);
    const letterN = new Letter('n', 1);
    const letterT = new Letter('t', 1);
    const a: LetterPosition = { letter: letterA, x: 6, y: 7 };
    const m: LetterPosition = { letter: letterM, x: 8, y: 7 };
    const e: LetterPosition = { letter: letterE, x: 9, y: 7 };
    const n: LetterPosition = { letter: letterN, x: 10, y: 7 };
    const t: LetterPosition = { letter: letterT, x: 11, y: 7 };
    const newLetters = [a, m, e, n, t];
    const letterPositionI: LetterPosition = { letter: letterI, x: 7, y: 7 };

    beforeEach(() => {
        board = new Board();
        board.getTile(7, 6)?.placeLetter(letterV);
        board.getTile(7, 7)?.placeLetter(letterI);
        board.getTile(7, 8)?.placeLetter(letterE);
        validationService = new WordValidation(dict);
    });
    it('Should return the correct score when all is good', () => {
        const score = validationService.validation(newLetters, board, true);
        const expectedScore = 10;
        expect(score).to.been.equal(expectedScore);
    });
    it('Should return  -1 when the user command is wrong', () => {
        const newA: LetterPosition = { letter: letterA, x: 1, y: 9 };
        const letters: LetterPosition[] = [newA];
        const score = validationService.validation(letters, board, true);
        const expectedScore = -1;
        expect(score).to.been.equal(expectedScore);
    });
    it('Should return  -1 when the user when at least one word is not in the dict', () => {
        board.getTile(8, 8)?.placeLetter(letterT);
        const score = validationService.validation(newLetters, board, true);
        const expectedScore = -1;
        expect(score).to.been.equal(expectedScore);
    });

    it('fakePlace should modify correctly the board', () => {
        validationService['board'] = board;
        validationService['newLetters'] = newLetters;
        validationService['fakePlace']();
        expect(validationService['board'].getTile(a.x, a.y)?.getLetter() === a.letter).to.equal(true);
        expect(validationService['board'].getTile(m.x, m.y)?.getLetter() === m.letter).to.equal(true);
        expect(validationService['board'].getTile(e.x, e.y)?.getLetter() === e.letter).to.equal(true);
        expect(validationService['board'].getTile(n.x, n.y)?.getLetter() === n.letter).to.equal(true);
        expect(validationService['board'].getTile(t.x, t.y)?.getLetter() === t.letter).to.equal(true);
    });
    it('fakePlace should throw -1 with the wrong positions ', () => {
        validationService['board'] = board;
        const newA: LetterPosition = { letter: letterA, x: 11, y: 9 };
        const letters: LetterPosition[] = [newA];
        validationService['newLetters'] = letters;
        expect(validationService['fakePlace'].bind(validationService)).to.throw('Invalid placement');
    });
    it('reverseFakePlace should work', () => {
        validationService['board'] = board;
        validationService['newLetters'] = newLetters;
        validationService['fakePlace']();
        validationService['reversePlace'](true);
        expect(validationService['board'].getTile(a.x, a.y)?.getLetter() === undefined).to.equal(true);
        expect(validationService['board'].getTile(m.x, m.y)?.getLetter() === undefined).to.equal(true);
        expect(validationService['board'].getTile(e.x, e.y)?.getLetter() === undefined).to.equal(true);
        expect(validationService['board'].getTile(n.x, n.y)?.getLetter() === undefined).to.equal(true);
        expect(validationService['board'].getTile(t.x, t.y)?.getLetter() === undefined).to.equal(true);
    });
    it('isOnStar should return true when the letter is on start', () => {
        board = new Board();
        const newA: LetterPosition = { letter: letterA, x: 7, y: 7 };
        board.getTile(7, 7)?.placeLetter(a.letter);
        validationService['board'] = board;
        expect(validationService['isOnStar'](newA)).to.equal(true);
    });
    it('isOnStar should return false when the letter is not on start', () => {
        board = new Board();
        board.getTile(7, 7)?.placeLetter(a.letter);
        validationService['board'] = board;
        expect(validationService['isOnStar'](a)).to.equal(false);
    });
    it('bingo should return 50 when there is a bingo', () => {
        const newA: LetterPosition = { letter: letterA, x: 12, y: 7 };
        const newM: LetterPosition = { letter: letterM, x: 13, y: 7 };
        const letters = [...newLetters, newA, newM];
        validationService['newLetters'] = letters;
        expect(validationService['bingo']()).to.equal(50);
    });

    it('bingo should return 0 when there is not  a bingo', () => {
        validationService['newLetters'] = newLetters;
        expect(validationService['bingo']()).to.equal(0);
    });
    it('admissibleWord should return all the word that have at least 2 letters', () => {
        const longWord: WordScore = { word: 'met', lettersArray: [m, e, t], lettersScore: [1, 1, 1], wordMultiplier: [] };
        const shortWord: WordScore = { word: 'm', lettersArray: [m], lettersScore: [1], wordMultiplier: [] };
        validationService['finnedWords'] = [longWord, shortWord];
        const expectedReturn: WordScore[] = [longWord];
        const result: WordScore[] = validationService['admissibleWord']();
        expect(result.length).to.equal(1);
        expect(result[0] === expectedReturn[0]).to.equal(true);
    });
    it('calculateLetterValue should apply  the good multiplier', () => {
        validationService['finnedWord'] = { word: '', lettersArray: [], lettersScore: [], wordMultiplier: [] };
        const normal: LetterPosition = { letter: letterA, x: 5, y: 2 };
        const doubleLetter: LetterPosition = { letter: letterM, x: 7, y: 3 };
        const tripleLetter: LetterPosition = { letter: letterN, x: 1, y: 5 };
        const doubleWord: LetterPosition = { letter: letterE, x: 1, y: 1 };
        const tripleWord: LetterPosition = { letter: letterT, x: 7, y: 0 };
        const expectedLettersScore: number[] = [
            letterA.getValue(),
            letterM.getValue() * 2,
            letterN.getValue() * 3,
            letterE.getValue(),
            letterT.getValue(),
        ];
        const expectedWordMultiplier: number[] = [2, 3];
        board.getTile(normal.x, normal.y)?.placeLetter(normal.letter);
        board.getTile(doubleLetter.x, doubleLetter.y)?.placeLetter(doubleLetter.letter);
        board.getTile(tripleLetter.x, tripleLetter.y)?.placeLetter(tripleLetter.letter);
        board.getTile(doubleWord.x, doubleWord.y)?.placeLetter(doubleWord.letter);
        board.getTile(tripleWord.x, tripleWord.y)?.placeLetter(tripleWord.letter);
        validationService['board'] = board;
        validationService['newLetters'] = [normal, doubleLetter, tripleLetter, doubleWord, tripleWord];
        validationService['calculateLetterValue']([normal.x, normal.y]);
        validationService['calculateLetterValue']([doubleLetter.x, doubleLetter.y]);
        validationService['calculateLetterValue']([tripleLetter.x, tripleLetter.y]);
        validationService['calculateLetterValue']([doubleWord.x, doubleWord.y]);
        validationService['calculateLetterValue']([tripleWord.x, tripleWord.y]);
        const result = validationService['finnedWord'];
        expect(result.lettersScore).to.eql(expectedLettersScore);
        expect(result.wordMultiplier).to.eql(expectedWordMultiplier);
    });
    it('searchUpToDown should return the right word', () => {
        validationService['newLetters'] = newLetters;
        validationService['board'] = board;
        expect(validationService['searchDirection'](letterPositionI, false).word).to.equal('vie');
    });
    it('letterHasAdjacent should return false it the letter do not have a adjacent', () => {
        validationService['board'] = board;
        expect(validationService['letterHasAdjacent'](t)).to.equal(false);
    });
    it('isVertical should return true when the user add just 1 letter ', () => {
        const newA: LetterPosition = { letter: letterA, x: 12, y: 7 };
        const letters: LetterPosition[] = [newA];
        validationService['newLetters'] = letters;
        const isVertical = validationService['isVertical'](letters);
        expect(isVertical).to.equal(true);
    });
    it('isVertical should return true when vertical ', () => {
        const newA: LetterPosition = { letter: letterA, x: 12, y: 7 };
        const newM: LetterPosition = { letter: letterM, x: 12, y: 8 };
        const letters: LetterPosition[] = [newA, newM];
        validationService['newLetters'] = letters;
        const isVertical = validationService['isVertical'](letters);
        expect(isVertical).to.equal(true);
    });
    it('isVertical should return false when not vertical', () => {
        validationService.validation(newLetters, board, true);
        const isVertical = validationService['isVertical'](newLetters);
        expect(isVertical).to.equal(false);
    });
    it('Should return -1 for the first letter if it is 1 letters ', () => {
        board = new Board();
        const newI: LetterPosition = { letter: letterI, x: 7, y: 7 };
        const letters: LetterPosition[] = [newI];
        const score = validationService.validation(letters, board, true);
        expect(score).to.equal(-1);
    });
    it('Should accept the first placement event if there is no adjacent', () => {
        board = new Board();
        const newA: LetterPosition = { letter: letterA, x: 7, y: 7 };
        const newM: LetterPosition = { letter: letterM, x: 7, y: 9 };
        const newE: LetterPosition = { letter: letterE, x: 7, y: 10 };
        const newI: LetterPosition = { letter: letterI, x: 7, y: 8 };
        const letters: LetterPosition[] = [newA, newE, newM, newI];
        validationService['newLetters'] = letters;
        validationService['board'] = board;
        validationService['fakePlace']();
        const newBoard: Board = validationService['board'];
        expect(newBoard.getTile(newA.x, newA.y)?.getLetter() === newA.letter).to.equal(true);
        expect(newBoard.getTile(newM.x, newM.y)?.getLetter() === newM.letter).to.equal(true);
        expect(newBoard.getTile(newI.x, newI.y)?.getLetter() === newI.letter).to.equal(true);
        expect(newBoard.getTile(newE.x, newE.y)?.getLetter() === newE.letter).to.equal(true);
    });
});
