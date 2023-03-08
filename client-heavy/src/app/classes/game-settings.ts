import { Timer } from './timer';
/**À CHANGER APRES */
export enum GameType {
    CLASSIC = 'Classic',
    LOG2990 = 'Log2990',
    CLASSIQUE = 'Classique',
}

export interface GameSettings {
    roomName: string;
    hostPlayerName: string;
    virtualPlayerName?: string;
    isSoloMode: boolean;
    isEasyMode?: boolean;
    timer: Timer;
    dictionary: string;
    gameType: GameType;
}