import { GameType } from './game-settings';
import { Timer } from './timer';

export interface WaitingRoom {
    hostName: string;
    roomName: string;
    timer: Timer;
    gameType: GameType;
}
