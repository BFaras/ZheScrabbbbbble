import { Letter } from '@app/classes/letter';
import { PlayerMessage } from '@app/controllers/command.controller';
import { Direction, RoomVisibility } from './basic-constants';

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
    players: PlayerState[];
    playerTurnIndex: number;
    reserveLength: number;
    gameOver: boolean;
    timeLeft: number;
    message?: PlayerMessage;
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
export interface GameRoomInfo {
    name: string;
    id: string;
    visibility: RoomVisibility;
    players: string[];
    isStarted: boolean;
    isCoop: boolean;
    nbObservers: number;
}
