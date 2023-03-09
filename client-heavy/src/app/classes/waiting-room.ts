
import { GameType } from '@app/constants/game-types';
import { Timer } from './timer';

export interface WaitingRoom {
    hostName: string;
    roomName: string;
    timer: Timer;
    gameType: GameType;
}
