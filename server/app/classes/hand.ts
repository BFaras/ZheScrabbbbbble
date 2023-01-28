import { Letter } from './letter';

export class Hand {
    private letters: Letter[];

    constructor(letters: Letter[]) {
        this.letters = letters;
    }

    getLetters(wantedLetters: string, removeLetter: boolean): Letter[] | null {
        const retrievedLetters: Letter[] = [];
        for (let i = 0; i < wantedLetters.length; i++) {
            for (let j = 0; j < this.letters.length; j++) {
                const letter = this.letters[j];
                const wantedLetter = wantedLetters.charAt(i);
                let isWantedLetter;
                if (wantedLetter === wantedLetter.toUpperCase() || wantedLetter === '*') {
                    isWantedLetter = letter.getChar() === 'blank';
                } else {
                    isWantedLetter = letter.getChar() === wantedLetters.charAt(i);
                }
                const isRetrieved = retrievedLetters.some((element) => {
                    return element === letter;
                });
                if (isWantedLetter && !isRetrieved) {
                    if (removeLetter) this.letters.splice(j, 1);
                    retrievedLetters.push(letter);
                    break;
                }
            }
        }
        if (retrievedLetters.length < wantedLetters.length) {
            this.addLetters(retrievedLetters);
            return null;
        }
        this.convertBlanks(retrievedLetters, wantedLetters);
        return retrievedLetters;
    }

    cutDownToSize(size: number) {
        this.letters = this.letters.splice(0, size);
    }

    convertBlanks(letters: Letter[], wantedString: string) {
        for (let i = 0; i < wantedString.length; i++) {
            letters[i].changeBlank(wantedString.charAt(i).toLowerCase());
        }
    }

    addLetters(addedLetters: Letter[]) {
        if (!addedLetters) return;
        for (const letter of addedLetters) {
            letter.revertBlank();
            this.letters.push(letter);
        }
    }

    getLength(): number {
        return this.letters.length;
    }

    getLettersToString(): string[] {
        const lettersToString: string[] = new Array();
        for (const letter of this.letters) {
            lettersToString.push(letter.getChar());
        }
        return lettersToString;
    }

    calculateHandScore(): number {
        let score = 0;
        for (const letter of this.letters) {
            score += letter.getValue();
        }
        return score;
    }
}
