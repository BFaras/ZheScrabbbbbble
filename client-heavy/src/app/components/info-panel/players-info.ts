import { Goal } from '@app/classes/goal';

export interface Player {
    name: string;
    currentScore: number;
    letterCount: number;
    active: boolean;
    winner: boolean;
    objectives: Goal[];
}

export const playersInfo = [
    {
        name: 'Joueur 1',
        currentScore: 0,
        letterCount: 0,
        active: false,
        winner: false,
        objectives: [],
    },
    {
        name: 'Joueur 2',
        currentScore: 0,
        letterCount: 0,
        active: false,
        winner: false,
        objectives: [],
    },
];
