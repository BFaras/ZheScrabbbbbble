export interface WaitingRoom {
    name: string;
    id: string;
    visibility: string;
    players: string[];
    isStarted: boolean;
    isCoop: boolean;
    nbObservers: number;
}
