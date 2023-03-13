import { Goal } from '@app/classes/goal';

export interface Player {
    name: string;
    currentScore: number;
    letterCount: number;
    active: boolean;
    winner: boolean;
    objectives: Goal[];
}