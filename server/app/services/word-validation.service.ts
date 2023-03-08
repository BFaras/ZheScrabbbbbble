import { Board } from '@app/classes/board';
import { Letter } from '@app/classes/letter';
import { Multiplier, Tile } from '@app/classes/tile';
import { LetterPosition } from '@app/constants/basic-interface';
import { Dictionary } from '@app/constants/database-interfaces';
import * as fs from 'fs';
import { Service } from 'typedi';

const MAXIMUM_OF_LETTERS = 7;
const BINGO = 50;
const STAR_POSITION = 7;
const ERROR_RETURN = -1;
enum Direction {
    Up = 'UP',
    Down = 'DOWN',
    Left = 'LEFT',
    Right = 'RIGHT',
}
export interface WordScore {
    word: string;
    lettersArray: LetterPosition[];
    lettersScore: number[];
    wordMultiplier: number[];
}
@Service()
export class WordValidation {
    protected newLetters: LetterPosition[];
    protected board: Board;
    private finnedWord: WordScore;
    private finnedWords: WordScore[];
    private dictionary: string[];
    constructor() {
        this.dictionary = (JSON.parse(fs.readFileSync('./assets/dictionnary.json', 'utf8')) as Dictionary).words;
    }
    validation(newLetters: LetterPosition[], board: Board, keepLetters: boolean): number {
        this.newLetters = newLetters;
        this.board = board;
        this.finnedWords = [];
        try {
            this.fakePlace();
            this.searchWords();
            const admissibleWord: WordScore[] = this.admissibleWord();
            const validWord: WordScore[] = this.dictionaryValidation(admissibleWord);
            const score: number = this.score(validWord);
            this.reversePlace(!keepLetters);
            return score;
        } catch (error) {
            this.reversePlace(!keepLetters);
            return ERROR_RETURN;
        }
    }
    protected admissibleWord(): WordScore[] {
        return this.finnedWords.filter((word) => word.word.length > 1);
    }

    private isVertical(letterPositions: LetterPosition[]): boolean {
        if (letterPositions.length < 2) return true;
        if (letterPositions[0].x === letterPositions[1].x) return true;
        return false;
    }

    private fakePlace(): void {
        if (this.validPlacement()) {
            for (const letter of this.newLetters) {
                this.board.getTile(letter.x, letter.y)?.placeLetter(letter.letter);
            }
        } else {
            throw Error('Invalid placement');
        }
    }
    private reversePlace(reverse: boolean): void {
        if (reverse) this.board.removeLetters(this.newLetters);
    }
    private validPlacement(): boolean {
        for (const letter of this.newLetters) {
            if (this.isOnStar(letter) || this.letterHasAdjacent(letter)) return true;
        }
        return false;
    }
    private isOnStar(letter: LetterPosition): boolean {
        return letter.x === STAR_POSITION && letter.y === STAR_POSITION;
    }

    private letterHasAdjacent(letter: LetterPosition): boolean | undefined {
        const x: number = letter.x;
        const y: number = letter.y;
        return (
            this.board.getTile(x + 1, y)?.hasLetter() ||
            this.board.getTile(x - 1, y)?.hasLetter() ||
            this.board.getTile(x, y + 1)?.hasLetter() ||
            this.board.getTile(x, y - 1)?.hasLetter()
        );
    }
    private bingo(): number {
        return this.newLetters.length === MAXIMUM_OF_LETTERS ? BINGO : 0;
    }

    private dictionaryValidation(words: WordScore[]): WordScore[] {
        if (words.length === 0) throw Error('Unvalid word');
        if (words.every((foundWord) => this.dictionary.includes(foundWord.word))) {
            return words;
        }
        throw Error('unvalid word');
    }
    private compareEqualLetter(letter1: LetterPosition, letter2: LetterPosition): boolean {
        return letter1.letter === letter2.letter && letter1.x === letter2.x && letter1.y === letter2.y;
    }

    private calculateLetterValue(position: number[]) {
        const tile: Tile = this.board.getTile(position[0], position[1]) as Tile;
        const currentLetterPosition: LetterPosition = { letter: tile.getLetter() as Letter, x: position[0], y: position[1] };
        const value = currentLetterPosition.letter.getValue();
        this.finnedWord.lettersArray.push(currentLetterPosition);
        if (this.newLetters.some((letter) => this.compareEqualLetter(letter, currentLetterPosition))) {
            switch (tile.getMultiplier()) {
                case Multiplier.Normal:
                    this.finnedWord.lettersScore.push(value);
                    break;
                case Multiplier.DoubleLetter:
                    this.finnedWord.lettersScore.push(value * 2);
                    break;
                case Multiplier.DoubleWord:
                    this.finnedWord.lettersScore.push(value);
                    this.finnedWord.wordMultiplier.push(2);
                    break;
                case Multiplier.TripleLetter:
                    this.finnedWord.lettersScore.push(value * 3);
                    break;
                case Multiplier.TripleWord:
                    this.finnedWord.lettersScore.push(value);
                    this.finnedWord.wordMultiplier.push(3);
                    break;
            }
        } else {
            this.finnedWord.lettersScore.push(value);
        }
    }
    private searchWords(): void {
        const isVertical: boolean = this.isVertical(this.newLetters);
        this.finnedWords.push(this.searchDirection(this.newLetters[0], !isVertical));
        for (const letter of this.newLetters) {
            this.finnedWords.push(this.searchDirection(letter, isVertical));
        }
    }

    private searchDirection(letter: LetterPosition, horizontal: boolean): WordScore {
        this.finnedWord = { word: '', lettersArray: [], lettersScore: [], wordMultiplier: [] };
        if (horizontal)
            this.finnedWord.word =
                this.search(Direction.Left, [letter.x, letter.y]) + this.search(Direction.Right, [letter.x + 1, letter.y]).toString();
        else this.finnedWord.word = this.search(Direction.Up, [letter.x, letter.y - 1]) + this.search(Direction.Down, [letter.x, letter.y]);
        return this.finnedWord;
    }

    private search(dir: Direction, position: number[]): string {
        let positionX = position[0];
        let positionY = position[1];
        let word = '';
        while (this.board.getTile(positionX, positionY)?.hasLetter()) {
            const tile = this.board.getTile(positionX, positionY) as Tile;
            const currentLetter: string = (tile.getLetter() as Letter).getChar();
            this.calculateLetterValue([positionX, positionY]);
            switch (dir) {
                case Direction.Down:
                    word = word + currentLetter;
                    positionY += 1;
                    break;

                case Direction.Up:
                    word = currentLetter + word;
                    positionY -= 1;
                    break;

                case Direction.Right:
                    word = word + currentLetter;
                    positionX += 1;
                    break;

                case Direction.Left:
                    word = currentLetter + word;
                    positionX -= 1;
                    break;
            }
        }
        return word;
    }

    private wordScoreCalcul(word: WordScore): number {
        let score = 0;
        for (const point of word.lettersScore) {
            score += point;
        }
        for (const multiplier of word.wordMultiplier) {
            score = score * multiplier;
        }
        return score;
    }
    private score(validWords: WordScore[]): number {
        let total = 0;
        for (const word of validWords) {
            total += this.wordScoreCalcul(word);
        }
        total += this.bingo();
        return total;
    }
}
