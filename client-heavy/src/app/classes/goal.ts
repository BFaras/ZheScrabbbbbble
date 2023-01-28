export interface Goal {
    title: string;
    points: number;
    completed: boolean;
    public?: boolean;
    progress?: PlayerProgress[];
    progressMax?: number;
}

export interface PlayerProgress {
    playerName: string;
    playerProgress: number;
}
