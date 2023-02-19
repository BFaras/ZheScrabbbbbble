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
    finalBoard: string[][];
    players: PlayerState[];
    playerTurnIndex: number;
    reserveLength: number;
    gameOver: boolean;
}

export interface PlayerState {
    username: string;
    hand: string[];
    score: number;
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
