import { BOARD_SIZE } from '@app/constants/basic-constants';
import { LetterPosition } from '@app/constants/basic-interface';
import { DOUBLE_LETTER_TILES, DOUBLE_WORD_TILES, TRIPLE_LETTER_TILES, TRIPLE_WORD_TILES } from '@app/constants/default-board-layout';
import { Letter } from './letter';
import { Multiplier, Tile } from './tile';

export class Board {
    private tiles: Tile[][];

    constructor() {
        this.initialiseTiles();
    }

    convertToString(): string {
        let text = '';
        for (const row of this.tiles) {
            text += row.toString() + '\n';
        }
        return text;
    }

    toStringArray(): string[][] {
        const stringArray: string[][] = [];
        for (const row of this.tiles) {
            const rowArray = [];
            for (const tile of row) {
                if (tile.hasLetter()) {
                    const letter = tile.getLetter() as Letter;
                    rowArray.push(letter.getValue() === 0 ? 'blank' + letter.getChar() : letter.getChar());
                } else {
                    rowArray.push('');
                }
            }
            stringArray.push(rowArray);
        }
        return stringArray;
    }

    getTile(x: number, y: number): Tile | null {
        if (x < 0 || x >= BOARD_SIZE) {
            return null;
        }
        if (y < 0 || y >= BOARD_SIZE) {
            return null;
        }
        return this.tiles[x][y];
    }

    placeLetters(positions: LetterPosition[]) {
        for (const letter of positions) {
            this.getTile(letter.x, letter.y)?.placeLetter(letter.letter);
        }
    }

    removeLetters(positions: LetterPosition[]) {
        for (const letter of positions) {
            this.getTile(letter.x, letter.y)?.removeLetter();
        }
    }

    private initialiseTiles() {
        this.tiles = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            const boardRow: Tile[] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (this.coordinateIsInArray(i, j, DOUBLE_LETTER_TILES)) {
                    boardRow.push(new Tile(Multiplier.DoubleLetter));
                } else if (this.coordinateIsInArray(i, j, DOUBLE_WORD_TILES)) {
                    boardRow.push(new Tile(Multiplier.DoubleWord));
                } else if (this.coordinateIsInArray(i, j, TRIPLE_LETTER_TILES)) {
                    boardRow.push(new Tile(Multiplier.TripleLetter));
                } else if (this.coordinateIsInArray(i, j, TRIPLE_WORD_TILES)) {
                    boardRow.push(new Tile(Multiplier.TripleWord));
                } else {
                    boardRow.push(new Tile(Multiplier.Normal));
                }
            }
            this.tiles.push(boardRow);
        }
    }

    private coordinateIsInArray(x: number, y: number, array: number[][]): boolean {
        for (const tile of array) {
            if (x === tile[0] && y === tile[1]) {
                return true;
            }
        }
        return false;
    }
}
