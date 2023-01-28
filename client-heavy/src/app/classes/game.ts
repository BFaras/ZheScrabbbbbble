import { Player } from './player';

export interface Game {
    date: string;
    time: string;
    length: string;
    player1: Player;
    player2: Player;
    mode: string;
    abandoned?: boolean;
}
