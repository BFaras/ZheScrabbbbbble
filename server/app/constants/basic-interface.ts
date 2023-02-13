import { Letter } from '@app/classes/letter';
import { Direction } from './basic-constants';

export interface LetterPosition {
    letter: Letter;
    x: number;
    y: number;
}
export interface PlaceLetterCommandInfo {
    letterCoord: number;
    numberCoord: number;
    direction: Direction;
    letters: string;
}

export interface GameState {
    board: string[][];
    hand: string[];
    opponentHandLength: number;
    isYourTurn: boolean;
    yourScore: number;
    opponentScore: number;
    reserveLength: number;
    gameOver: boolean;
    boardWithInvalidWords?: string[][];
}

export interface Message {
    username: string;
    body: string;
    color?: string;
}
export class Timer {
    minute: number;
    second: number;
}
