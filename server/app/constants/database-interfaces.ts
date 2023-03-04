import { Question } from '@app/interfaces/question';
import { GameType } from './basic-constants';

export interface Score {
    username: string;
    score: number;
}

export interface TopScores {
    [key: string]: string[];
}

export interface Dictionary {
    title: string;
    description: string;
    words?: string[];
}

export interface PlayerName {
    name: string;
    difficulty: VirtualPlayerDifficulty;
    default: boolean;
}

export interface GameHistory {
    date: string;
    time: string;
    length: string;
    player1: PlayerInfo;
    player2: PlayerInfo;
    mode: GameType;
    abandoned?: boolean;
}

export interface PlayerInfo {
    name: string;
    score: number;
    virtual: boolean;
    difficulty?: VirtualPlayerDifficulty;
    winner: boolean;
}

export interface AccountInfo {
    username: string;
    encryptedPassword: string;
    email: string;
    securityQuestion: Question;
}

export const enum VirtualPlayerDifficulty {
    BEGINNER = 'débutant',
    EXPERT = 'expert',
}

export enum CollectionType {
    SCORE = 'scoreboard',
    DICTIONARY = 'dictionary',
    NAMES = 'playerNames',
    GAMES = 'gameHistory',
    USERACCOUNTS = 'userAccount',
    CHATCANALS = 'chatCanals',
    PROFILEINFO = 'profileInfo',
}
