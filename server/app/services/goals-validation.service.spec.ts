/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Board } from '@app/classes/board';
import { Letter } from '@app/classes/letter';
import { LetterPosition } from '@app/constants/basic-interface';
import {
    EIGHT_OR_MORE_LETTER,
    FOUR_WORDS_AT_ONCE,
    ONLY_VOWEL,
    SPECIAL_CASES_PLACEMENT,
    SWAP_FIFTEEN_LETTERS,
    TEN_POINT_PLACEMENT,
    THREE_TIME_SAME_LETTER,
} from '@app/constants/goal-constants';
import { expect } from 'chai';
import { assert } from 'console';
import { GoalsValidation } from './goals-validation.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');

describe('GoalValidation', () => {
    let goalValidationService: GoalsValidation;
    const dict: string[] = ['aime', 'trouver', 'vie', 'aiment', 'eeeeeeee', 'net'];
    let board: Board;
    const letterV = new Letter('v', 2);
    const letterI = new Letter('i', 3);
    const letterE = new Letter('e', 1);
    const letterA = new Letter('a', 2);
    const letterM = new Letter('m', 1);
    const letterN = new Letter('n', 1);
    const letterT = new Letter('t', 1);
    const letterB = new Letter('b', 2);
    const letterO = new Letter('o', 2);
    const letterY = new Letter('y', 2);

    const b: LetterPosition = { letter: letterB, x: 10, y: 7 };
    const a: LetterPosition = { letter: letterA, x: 6, y: 7 };
    const m: LetterPosition = { letter: letterM, x: 8, y: 7 };
    const e: LetterPosition = { letter: letterE, x: 9, y: 7 };
    const n: LetterPosition = { letter: letterN, x: 10, y: 7 };
    const t: LetterPosition = { letter: letterT, x: 11, y: 7 };
    const newLetters = [a, m, e, n, t];
    // const letterPositionI: LetterPosition = { letter: letterI, x: 7, y: 7 };
    beforeEach(() => {
        goalValidationService = new GoalsValidation(dict);
        board = new Board();
        board.getTile(7, 6)?.placeLetter(letterV);
        board.getTile(7, 7)?.placeLetter(letterI);
        board.getTile(7, 8)?.placeLetter(letterE);
    });
    it('objectifValidation should call goalAnalyser ', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = Sinon.spy(GoalsValidation.prototype, 'goalAnalyser' as any);
        goalValidationService.goalValidation(newLetters, board, true, [FOUR_WORDS_AT_ONCE]);
        assert(spy.called);
        spy.restore();
    });
    it('goalAnalyser should call the right method ', () => {
        goalValidationService.validation(newLetters, board, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = Sinon.spy(GoalsValidation.prototype, 'fourWordInAPlacement' as any);
        goalValidationService['goalAnalyser'](FOUR_WORDS_AT_ONCE);
        assert(spy.called);
        spy.restore();
    });
    it('goalAnalyser should call the right method ', () => {
        goalValidationService.validation(newLetters, board, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = Sinon.spy(GoalsValidation.prototype, 'tenPoint' as any);
        goalValidationService['goalAnalyser'](TEN_POINT_PLACEMENT);
        assert(spy.called);
        spy.restore();
    });
    it('goalAnalyser should call the right method ', () => {
        goalValidationService.validation(newLetters, board, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = Sinon.spy(GoalsValidation.prototype, 'onlyVowels' as any);
        goalValidationService['goalAnalyser'](ONLY_VOWEL);
        assert(spy.called);
        spy.restore();
    });
    it('goalAnalyser should call the right method ', () => {
        goalValidationService.validation(newLetters, board, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = Sinon.spy(GoalsValidation.prototype, 'atLeastEightLetter' as any);
        goalValidationService['goalAnalyser'](EIGHT_OR_MORE_LETTER);
        assert(spy.called);
        spy.restore();
    });
    it('goalAnalyser should call the right method ', () => {
        goalValidationService.validation(newLetters, board, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = Sinon.spy(GoalsValidation.prototype, 'twoSpecialCase' as any);
        goalValidationService['goalAnalyser'](SPECIAL_CASES_PLACEMENT);
        assert(spy.called);
        spy.restore();
    });
    it('goalAnalyser should call the right method ', () => {
        goalValidationService.validation(newLetters, board, true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = Sinon.spy(GoalsValidation.prototype, 'threeTimeTheSameLetter' as any);
        goalValidationService['goalAnalyser'](THREE_TIME_SAME_LETTER);
        assert(spy.called);
        spy.restore();
    });
    it('goalAnalyser should not modify the score if it is the goal SwapFifteen ', () => {
        const initScore = goalValidationService.validation(newLetters, board, true);

        const score = goalValidationService.goalValidation(newLetters, board, true, [SWAP_FIFTEEN_LETTERS]);
        expect(initScore === score).to.equal(true);
    });
    it('OnlyVowels should add the right score ', () => {
        const letters = [a];
        const firstScore = goalValidationService.validation(letters, board, true);
        goalValidationService['theScore'] = firstScore;
        goalValidationService['onlyVowels'](ONLY_VOWEL);
        const newScore = goalValidationService['theScore'];
        expect(newScore - firstScore).to.equal(ONLY_VOWEL.points);
    });
    it('threeTimeTheSameLetter should return the right score ', () => {
        board = new Board();
        board.getTile(7, 7)?.placeLetter(letterB);
        board.getTile(8, 7)?.placeLetter(letterO);
        board.getTile(9, 7)?.placeLetter(letterB);
        board.getTile(11, 7)?.placeLetter(letterY);
        const firstScore = goalValidationService.validation([b], board, true);
        goalValidationService['theScore'] = firstScore;
        goalValidationService['threeTimeTheSameLetter'](THREE_TIME_SAME_LETTER);
        const newScore = goalValidationService['theScore'];

        expect(newScore - firstScore).to.equal(THREE_TIME_SAME_LETTER.points);
    });
    it('tenPoint should add the right score ', () => {
        const firstScore = 10;
        goalValidationService['theScore'] = 10;
        goalValidationService['tenPoint'](10, TEN_POINT_PLACEMENT);
        const newScore = goalValidationService['theScore'];
        expect(newScore - firstScore).to.equal(TEN_POINT_PLACEMENT.points);
    });
    it('atLeastEightLetter should add the right Score ', () => {
        board.getTile(5, 8)?.placeLetter(letterE);
        board.getTile(6, 8)?.placeLetter(letterE);
        board.getTile(8, 8)?.placeLetter(letterE);
        board.getTile(9, 8)?.placeLetter(letterE);
        board.getTile(10, 8)?.placeLetter(letterE);
        board.getTile(11, 8)?.placeLetter(letterE);
        const E: LetterPosition = { letter: letterE, x: 12, y: 8 };
        const firstScore = goalValidationService.validation([E], board, true);

        goalValidationService['theScore'] = firstScore;
        goalValidationService['atLeastEightLetter'](EIGHT_OR_MORE_LETTER);
        const newScore = goalValidationService['theScore'];

        expect(newScore - firstScore).to.equal(EIGHT_OR_MORE_LETTER.points);
    });
    it('fourWordInAPlacement should  add the right score', () => {
        const anomyme = () => {
            return [1, 2, 3, 4];
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Sinon.stub(goalValidationService, 'admissibleWord' as any).callsFake(anomyme);
        goalValidationService['theScore'] = 0;
        goalValidationService['fourWordInAPlacement'](FOUR_WORDS_AT_ONCE);
        expect(goalValidationService['theScore']).equals(FOUR_WORDS_AT_ONCE.points);
    });
    it('twoSpecialCase should add the right score', () => {
        const myN: LetterPosition = { letter: letterN, x: 6, y: 8 };
        const myT: LetterPosition = { letter: letterT, x: 8, y: 8 };
        const letters = [myN, myT];
        const simpleScore = 5;
        const scoreWithGoals = goalValidationService.goalValidation(letters, board, true, [SPECIAL_CASES_PLACEMENT]);
        expect(scoreWithGoals - simpleScore).equals(SPECIAL_CASES_PLACEMENT.points);
    });
    it(' should not call the assigned function  if the goals is completed', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = Sinon.spy(GoalsValidation.prototype, 'twoSpecialCase' as any);
        SPECIAL_CASES_PLACEMENT.completed = true;
        goalValidationService.goalValidation(newLetters, board, true, [SPECIAL_CASES_PLACEMENT]);
        assert(spy.notCalled);
    });
});
