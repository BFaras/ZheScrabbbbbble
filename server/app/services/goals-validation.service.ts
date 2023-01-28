import { Board } from '@app/classes/board';
import { Letter } from '@app/classes/letter';
import { Multiplier } from '@app/classes/tile';
import {
    AT_LEAST_EIGHT_LETTER_CONST,
    FOUR_WORD,
    FOUR_WORD_IN_A_PLACEMENT_SCORE,
    TEN_POINT,
    TEN_POINT_SCORE,
    TWO_SPECIALS_CASES_CONSTANT,
} from '@app/constants/basic-constants';
import { LetterPosition } from '@app/constants/basic-interface';
import { EIGHT_OR_MORE_LETTER, Goal, GoalsTitle, ONLY_VOWEL, SPECIAL_CASES_PLACEMENT, THREE_TIME_SAME_LETTER } from '@app/constants/goal-constants';
import { WordValidation } from './word-validation.service';

export interface LetterFrequency {
    letter: Letter;
    frequency: number;
}

export class GoalsValidation extends WordValidation {
    private theScore: number;

    goalValidation(newLetters: LetterPosition[], board: Board, keepLetters: boolean, goals?: Goal[]): number {
        this.theScore = this.validation(newLetters, board, keepLetters);
        goals?.forEach((goal) => this.goalAnalyser(goal));
        return this.theScore;
    }
    private goalAnalyser(goal: Goal) {
        if (goal.completed === true) return;
        switch (goal.title) {
            case GoalsTitle.OnlyVowel:
                this.onlyVowels(goal);
                break;
            case GoalsTitle.FiveRounds:
                break;
            case GoalsTitle.FourWordsAtOnce:
                this.fourWordInAPlacement(goal);

                break;
            case GoalsTitle.AtLeastEightLetters:
                this.atLeastEightLetter(goal);

                break;
            case GoalsTitle.SpecialCasesPlacement:
                this.twoSpecialCase(goal);

                break;
            case GoalsTitle.ThreeTimesSameLetter:
                this.threeTimeTheSameLetter(goal);

                break;
            case GoalsTitle.TenPointsPlacement:
                this.tenPoint(this.theScore, goal);

                break;
            case GoalsTitle.SwapFifteenLetters:
                break;
        }
    }

    private fourWordInAPlacement(goal: Goal) {
        if (this.admissibleWord().length === FOUR_WORD) {
            this.theScore += FOUR_WORD_IN_A_PLACEMENT_SCORE;
            goal.completed = true;
        }
    }

    private threeTimeTheSameLetter(goal: Goal) {
        for (const word of this.admissibleWord()) {
            const counter: LetterFrequency[] = [];
            for (const letterPosition of word.lettersArray) {
                const index = counter.findIndex((letter) => letter.letter.getChar() === letterPosition.letter.getChar());
                if (index >= 0) {
                    counter[index].frequency++;
                } else {
                    const newLetterFrequency: LetterFrequency = { letter: letterPosition.letter, frequency: 1 };
                    counter.push(newLetterFrequency);
                }
            }
            if (counter.find((letter) => letter.frequency >= 3)) {
                this.theScore += THREE_TIME_SAME_LETTER.points;
                goal.completed = true;
                break;
            }
        }
    }
    private onlyVowels(goal: Goal) {
        if (this.onlyVowelsValidation()) {
            this.theScore += ONLY_VOWEL.points;
            goal.completed = true;
        }
    }
    private onlyVowelsValidation(): boolean {
        const vowelsList = ['a', 'e', 'i', 'u', 'o', 'y'];
        let accomplished = false;
        for (const word of this.admissibleWord()) {
            accomplished = true;
            for (const letterPosition of word.lettersArray) {
                if (!vowelsList.includes(letterPosition.letter.getChar())) accomplished = false;
            }
        }
        return accomplished;
    }
    private atLeastEightLetter(goal: Goal) {
        for (const word of this.admissibleWord()) {
            if (word.lettersArray.length > AT_LEAST_EIGHT_LETTER_CONST) {
                this.theScore += EIGHT_OR_MORE_LETTER.points;
                goal.completed = true;
            }
        }
    }
    private tenPoint(initialScore: number, goal: Goal) {
        if (initialScore === TEN_POINT) {
            this.theScore += TEN_POINT_SCORE;
            goal.completed = true;
        }
    }

    private twoSpecialCase(goal: Goal) {
        let specialCasesCounter = 0;
        for (const letter of this.newLetters) {
            if (this.board.getTile(letter.x, letter.y)?.getMultiplier() !== Multiplier.Normal) specialCasesCounter++;
        }
        if (specialCasesCounter >= TWO_SPECIALS_CASES_CONSTANT) {
            this.theScore += SPECIAL_CASES_PLACEMENT.points;
            goal.completed = true;
        }
    }
}
