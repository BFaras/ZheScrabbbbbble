import { VirtualPlayerDifficulty } from './virtual-player-difficulty';

export interface Player {
    name: string;
    score: number;
    virtual: boolean;
    difficulty?: VirtualPlayerDifficulty;
    winner: boolean;
}
