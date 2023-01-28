import { Letter } from './letter';

export enum Multiplier {
    Normal,
    DoubleLetter,
    DoubleWord,
    TripleLetter,
    TripleWord,
}

export class Tile {
    private letter: Letter | undefined;
    private multiplier: Multiplier;

    constructor(multiplier: Multiplier) {
        this.multiplier = multiplier;
    }

    hasLetter(): boolean {
        return this.letter !== undefined;
    }

    placeLetter(letter: Letter) {
        this.letter = letter;
    }

    removeLetter() {
        this.letter = undefined;
    }

    toString(): string {
        return this.multiplier.toString();
    }

    getMultiplier(): Multiplier {
        return this.multiplier;
    }

    getLetter(): Letter | undefined {
        return this.letter;
    }
}
