import { Timer } from '@app/constants/basic-interface';

export interface GameSettings {
    hostPlayerName: string;
    isSoloMode: boolean;
    timer: Timer;
    dictionary: string;
    roomName: string;
    virtualPlayerName?: string;
    isEasyMode?: boolean;
}
