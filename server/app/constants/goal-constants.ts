export enum GoalsTitle {
    OnlyVowel = 'Former un mot qui contient seulement des voyelles (a,e,i,o,u,y)',
    FiveRounds = "Former un mot valide 5 tours d'affilées",
    FourWordsAtOnce = 'Former 4 mots en un placement',
    ThreeTimesSameLetter = 'Former un mot qui contient 3 fois la même lettre',
    AtLeastEightLetters = 'Former un mot de plus de 7 lettres',
    TenPointsPlacement = 'Faire un placement qui vaut exactement 10 points',
    SwapFifteenLetters = 'Échanger 15 lettres au cours de la partie',
    SpecialCasesPlacement = 'Faire un placement sur 2 cases spéciales de type différent en même temps',
}
export interface PlayerProgress {
    playerName: string;
    playerProgress: number;
}
export interface Goal {
    title: string;
    points: number;
    completed: boolean;
    public?: boolean;
    progress?: PlayerProgress[];
    progressMax?: number;
}
export const ONLY_VOWEL: Goal = { title: GoalsTitle.OnlyVowel, points: 10, completed: false };
export const FIVE_ROUND: Goal = { title: GoalsTitle.FiveRounds, points: 20, completed: false, progressMax: 5 };
export const FOUR_WORDS_AT_ONCE: Goal = { title: GoalsTitle.FourWordsAtOnce, points: 30, completed: false };
export const THREE_TIME_SAME_LETTER: Goal = { title: GoalsTitle.ThreeTimesSameLetter, points: 30, completed: false };
export const EIGHT_OR_MORE_LETTER: Goal = { title: GoalsTitle.AtLeastEightLetters, points: 20, completed: false };
export const TEN_POINT_PLACEMENT: Goal = { title: GoalsTitle.TenPointsPlacement, points: 15, completed: false };
export const SWAP_FIFTEEN_LETTERS: Goal = {
    title: GoalsTitle.SwapFifteenLetters,
    points: 15,
    completed: false,
    progressMax: 15,
};
export const SPECIAL_CASES_PLACEMENT: Goal = { title: GoalsTitle.SpecialCasesPlacement, points: 10, completed: false };

export const GOALS: Goal[] = [
    ONLY_VOWEL,
    FIVE_ROUND,
    FOUR_WORDS_AT_ONCE,
    THREE_TIME_SAME_LETTER,
    EIGHT_OR_MORE_LETTER,
    TEN_POINT_PLACEMENT,
    SWAP_FIFTEEN_LETTERS,
    SPECIAL_CASES_PLACEMENT,
];
