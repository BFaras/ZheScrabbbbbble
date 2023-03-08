import { Board } from '@app/classes/board';
import { Hand } from '@app/classes/hand';
import { Tile } from '@app/classes/tile';
import {
    BLANK_LENGTH_CUTOFF_HINT,
    BLANK_LENGTH_CUTOFF_VIRTUAL_PLAY,
    BOARD_SIZE,
    Direction,
    LETTER_USED_FOR_FIND_POSSIBLE_WORD,
    MAX_SIZE_HINT,
    MAX_SIZE_VIRTUAL_PLAY,
    MAX_TIME_HINT,
    MAX_TIME_VIRTUAL_PLAY,
} from '@app/constants/basic-constants';
import { PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import Container from 'typedi';
import { CommandFormattingService } from './command-formatting.service';
import { WordValidation } from './word-validation.service';

export interface PossibleWords {
    command: PlaceLetterCommandInfo;
    value: number;
}
export interface SearchInfo {
    length: number;
    goingUp: boolean;
}

export interface Position {
    x: number;
    y: number;
}
export interface GameInfo {
    hand: Hand;
    board: Board;
}

export class PossibleWordFinder {
    
    private static wordValidation = Container.get(WordValidation);
    
    static findWords(gameInfo: GameInfo, virtualPlay: boolean): PossibleWords[] {
        const originalHandSize: number = gameInfo.hand.getLength();
        const maxSize = virtualPlay ? MAX_SIZE_VIRTUAL_PLAY : MAX_SIZE_HINT;
        const blankLengthCutoff = virtualPlay ? BLANK_LENGTH_CUTOFF_VIRTUAL_PLAY : BLANK_LENGTH_CUTOFF_HINT;
        const endTime: number = Date.now() + (virtualPlay ? MAX_TIME_VIRTUAL_PLAY : MAX_TIME_HINT);
        const letterPermutations: string[] = this.findPermutations(gameInfo.hand.getLettersToString(), blankLengthCutoff);
        const adjacentTiles = this.findAdjacentOccupied(gameInfo.board);
        const words: PossibleWords[] = [];
        for (const letterPermutation of letterPermutations) {
            words.push(...this.findWordsFromPlacements(adjacentTiles, gameInfo, letterPermutation));
            if (words.length > maxSize || Date.now() >= endTime) break;
        }
        gameInfo.hand.cutDownToSize(originalHandSize);
        return words;
    }
    private static findPermutations(hand: string[], blankLengthCutoff: number): string[] {
        hand = hand.filter((element, i) => i === hand.indexOf(element) || hand[i] !== 'blank');
        let permutations: string[];
        try {
            permutations = this.recursivePermutations(hand, '', blankLengthCutoff);
        } catch (e) {
            permutations = [];
        }
        return permutations
            .filter((element, i) => i === permutations.indexOf(element))
            .sort((a, b) => {
                return a.length - b.length;
            });
    }

    private static recursivePermutations(remainingLetters: string[], currentPermut: string, blankLengthCutoff: number): string[] {
        const permutations: string[] = [];
        for (let i = 0; i < remainingLetters.length; i++) {
            if (remainingLetters[i] !== 'blank') {
                permutations.push(currentPermut + remainingLetters[i]);
                const copyLetter = [...remainingLetters];
                copyLetter.splice(i, 1);
                permutations.push(...this.recursivePermutations(copyLetter, currentPermut + remainingLetters[i], blankLengthCutoff));
            } else if (currentPermut.length < blankLengthCutoff) {
                permutations.push(...this.blankPermutations(remainingLetters, currentPermut, i));
            }
        }
        return permutations;
    }

    private static blankPermutations(remainingLetters: string[], currentPermut: string, index: number): string[] {
        const permutations: string[] = [];
        const copyLetter = [...remainingLetters];
        copyLetter.splice(index, 1);
        const endPermutations = this.recursivePermutations(copyLetter, '', 0);
        endPermutations.push('');
        for (const permutation of endPermutations) {
            for (const letter of LETTER_USED_FOR_FIND_POSSIBLE_WORD) {
                permutations.push(currentPermut + letter + permutation);
            }
        }
        return permutations;
    }

    private static findOccupiedTiles(board: Board): Position[] {
        const occupiedTiles: Position[] = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board.getTile(i, j)?.hasLetter()) occupiedTiles.push({ x: i, y: j });
            }
        }
        return occupiedTiles;
    }

    private static findAdjacentOccupied(board: Board): Position[] {
        const occupiedTiles = this.findOccupiedTiles(board);
        if (occupiedTiles.length === 0) return [{ x: 7, y: 7 }];
        const adjacentTiles: Position[] = [];
        for (const tile of occupiedTiles) {
            adjacentTiles.push(...this.findAdjacent(board, tile));
        }
        return adjacentTiles.filter((element, i) => i === adjacentTiles.indexOf(element));
    }
    private static findAdjacent(board: Board, position: Position): Position[] {
        const adjacentTiles: Position[] = [];
        adjacentTiles.push(...this.addValidTile(board, { x: position.x, y: position.y + 1 }));
        adjacentTiles.push(...this.addValidTile(board, { x: position.x, y: position.y - 1 }));
        adjacentTiles.push(...this.addValidTile(board, { x: position.x + 1, y: position.y }));
        adjacentTiles.push(...this.addValidTile(board, { x: position.x - 1, y: position.y }));
        return adjacentTiles;
    }
    private static addValidTile(board: Board, position: Position): Position[] {
        if (this.validateTile(board.getTile(position.x, position.y))) return [{ x: position.x, y: position.y }];
        return [];
    }
    private static validateTile(tile: Tile | null) {
        return tile !== null && !tile.hasLetter();
    }
    private static findPossibleFromTile(adjacentTile: Position, board: Board, permutation: string): PlaceLetterCommandInfo[] {
        const possiblePlacements: PlaceLetterCommandInfo[] = [];
        if (permutation.length === 1)
            return [{ letterCoord: adjacentTile.x, numberCoord: adjacentTile.y, letters: permutation, direction: Direction.Horizontal }];
        possiblePlacements.push(...this.search({ length: permutation.length, goingUp: true }, { x: adjacentTile.x, y: adjacentTile.y }, permutation));
        possiblePlacements.push(
            ...this.search({ length: permutation.length, goingUp: false }, { x: adjacentTile.x, y: adjacentTile.y }, permutation),
        );
        return possiblePlacements;
    }
    private static search(searchInfo: SearchInfo, currentTile: Position, permutation: string): PlaceLetterCommandInfo[] {
        if (searchInfo.length === 0) return [];
        return [
            { letterCoord: currentTile.x, numberCoord: currentTile.y, letters: permutation, direction: this.getDirection(searchInfo.goingUp) },
        ].concat(
            this.search(
                { length: searchInfo.length - 1, goingUp: searchInfo.goingUp },
                this.getNextTile(currentTile, searchInfo.goingUp),
                permutation,
            ),
        );
    }
    private static getDirection(goingUp: boolean): Direction {
        return goingUp ? Direction.Vertical : Direction.Horizontal;
    }
    private static getNextTile(previousTile: Position, goingUp: boolean): Position {
        if (goingUp) return { x: previousTile.x + 1, y: previousTile.y };
        return { x: previousTile.x, y: previousTile.y - 1 };
    }
    private static findWordsFromPlacements(adjacentTiles: Position[], gameInfo: GameInfo, permutation: string): PossibleWords[] {
        const possiblePlacements = this.findPlacements(adjacentTiles, gameInfo.board, permutation);
        const words: PossibleWords[] = [];
        for (const possiblePlacement of possiblePlacements) {
            const letterPosition = CommandFormattingService.formatCommandPlaceLetter(
                possiblePlacement,
                gameInfo.board,
                gameInfo.hand.getLetters(permutation, false),
            );
            if (letterPosition) {
                const wordValue = this.wordValidation.validation(letterPosition, gameInfo.board, false);
                if (wordValue > 0) words.push({ command: possiblePlacement, value: wordValue });
            }
        }
        return words;
    }
    private static findPlacements(adjacentTiles: Position[], board: Board, permutation: string): PlaceLetterCommandInfo[] {
        const possiblePlacements: PlaceLetterCommandInfo[] = [];
        for (const adjacentTile of adjacentTiles) {
            possiblePlacements.push(...this.findPossibleFromTile(adjacentTile, board, permutation));
        }
        return possiblePlacements.filter((element, i) => i === possiblePlacements.indexOf(element));
    }
}
