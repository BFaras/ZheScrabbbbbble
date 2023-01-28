import { LETTERS } from '@app/constants/default-reserve-content';
import { Letter } from './letter';

export class Reserve {
    private letters: Letter[];

    constructor() {
        this.letters = new Array();
        LETTERS.forEach((letter) => {
            for (let i = 0; i < letter[1]; i++) {
                this.letters.push(new Letter(letter[0], letter[2]));
            }
        });
    }
    drawLetters(drawCount: number): Letter[] {
        const drawnLetters: Letter[] = new Array();
        for (let i = 0; i < drawCount; i++) {
            const letter: Letter = this.letters.splice(Math.floor(Math.random() * this.letters.length), 1)[0];
            if (letter !== undefined) drawnLetters.push(letter);
        }
        return drawnLetters;
    }
    returnLetters(returnedLetters: Letter[]) {
        this.letters = this.letters.concat(returnedLetters);
    }
    isEmpty(): boolean {
        return this.letters.length === 0;
    }
    canSwap(): boolean {
        return this.letters.length > 0;
    }
    getLength(): number {
        return this.letters.length;
    }
    getReserveContent(): string {
        const reserveContent: { [key: string]: number } = {
            a: 0,
            b: 0,
            c: 0,
            d: 0,
            e: 0,
            f: 0,
            g: 0,
            h: 0,
            i: 0,
            j: 0,
            k: 0,
            l: 0,
            m: 0,
            n: 0,
            o: 0,
            p: 0,
            q: 0,
            r: 0,
            s: 0,
            t: 0,
            u: 0,
            v: 0,
            w: 0,
            x: 0,
            y: 0,
            z: 0,
            blank: 0,
        };
        for (const letter of this.letters) {
            reserveContent[letter.getChar()]++;
        }
        let messageReserve = '';
        for (const [key, value] of Object.entries(reserveContent)) {
            if (key === 'blank') messageReserve += '*' + ' : ' + value + ' ';
            else messageReserve += key + ' : ' + value + ' \n';
        }
        return messageReserve;
    }
}
