import { ObjectId } from 'mongodb';

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

export interface PlayerGameInfo {
    name: string;
    score: number;
}

export interface ProfileInfo {
    avatar: string;
    level: number;
    userCode: string;
    stats: StatisticInfo[];
    tournamentWins: number[];
    connectionHistory: ConnectionInfo[];
    gameHistory: GameInfo[];
}

export interface ProfileInfoDB {
    _id: ObjectId;
    profileInfo: ProfileInfo;
}
