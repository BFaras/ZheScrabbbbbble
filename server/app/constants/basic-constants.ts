/* eslint-disable @typescript-eslint/no-magic-numbers */
export const CHAR_CODE_LETTER_A = 97;

export const LETTER_USED_FOR_FIND_POSSIBLE_WORD = ['A', 'E', 'I', 'L', 'N', 'O', 'R', 'S', 'T', 'U'];

export const BLANK_LENGTH_CUTOFF_HINT = 2;
export const BLANK_LENGTH_CUTOFF_VIRTUAL_PLAY = 3;

export const BOARD_SIZE = 15;

export const HAND_SIZE = 7;

export const ALPHABET_SIZE = 26;

export const MINIUM_NUMBER_LETTER_SWAP = 7;

export const NUMBER_PASS_ENDING_GAME = 6;

export const MAX_TIME_VIRTUAL_PLAY = 20000;
export const MAX_TIME_HINT = 5000;

export const MAX_SIZE_HINT = 60;
export const MAX_SIZE_VIRTUAL_PLAY = 120;

export const MIN_PLAY_TIME = 3000;

export const LOW_RANGE = [1, 6];
export const MEDIUM_RANGE = [7, 12];
export const HIGH_RANGE = [13, 18];
export const MAX_HAND = 7;
export const LESS_THAN_SIX_PROBABILITY = 0.4;
export const SHUFFLING_CONSTANT = 0.5;
export const BETWEEN_THIRTEEN_TO_EIGHTEEN_PROBABILITY = 0.7;
export const VALUE_FOR_SWAP = 0.1;
export const VALUE_FOR_PASS = 0.9;

export const MILLISECOND_IN_SECONDS = 1000;
export const MILLISECOND_IN_MINUTES = 60000;
export const MILLISECOND_IN_HOURS = 3600000;
export const TIME_BASE = 60;
export const DECIMAL_BASE = 10;

export const FOUR_WORD_IN_A_PLACEMENT_SCORE = 30;
export const FOUR_WORD = 4;
export const TEN_POINT = 10;
export const TEN_POINT_SCORE = 15;
export const AT_LEAST_EIGHT_LETTER_CONST = 7;
export const TWO_SPECIALS_CASES_CONSTANT = 2;

export const MAX_NUMBER_OF_PLAYERS = 4;

export enum ErrorType {
    IllegalCommand,
    InvalidSyntax,
}
export enum Direction {
    Vertical,
    Horizontal,
}
