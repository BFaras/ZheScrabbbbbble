


export enum ConnectionType {
    CONNECTION,
    DISCONNECTION,
}

export interface StatisticInfo {
    name: string;
    statAmount: number;
}

export interface ConnectionInfo {
    connectionType: ConnectionType;
    date: string;
    time: string;
}

export interface GameInfo {
    date: string;
    time: string;
    length: string;
    winnerIndex: number;
    players: PlayerGameInfo[];
    gameMode: string;
}

export interface GameHistoryInfo {
    date: string;
    time: string;
    isWinner: boolean;
}

export interface PlayerGameInfo {
    name: string;
    score: number;
}

export interface ProfileInfo {
    avatar: string;
    levelInfo: {
        level: number,
        xp: number,
        nextLevelXp: number,
    },
    userCode: string;
    stats: StatisticInfo[];
    tournamentWins: number[];
    connectionHistory: ConnectionInfo[];
    gameHistory: GameHistoryInfo[];
}

export interface ProfileSettings {
    theme: string;
    language: string;
}

export interface ProfileInfoDB {
    _id: string;
    profileInfo: ProfileInfo;
    profileSettings: ProfileSettings;
}
