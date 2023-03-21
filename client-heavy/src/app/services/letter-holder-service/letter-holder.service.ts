import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HOLDER_MEASUREMENTS, LETTER_POINTS, TILE_COLORS_CLASSIC, TILE_COLORS_GREEN, TILE_COLORS_INVERTED, TILE_COLORS_PINK } from '@app/constants/letters-constants';
import { classic, green, inverted, pink } from '@app/constants/themes';
import { ThemesService } from '../themes-service/themes-service';

@Injectable({
    providedIn: 'root',
})
export class LetterHolderService {
    letterLog = new Map<number, string>();
    holderState: string[] = [];
    holderStatePoints:number[] = [];
    subjectHolderStatePoints:Subject<number[]> = new Subject()
    private holderSize = { x: HOLDER_MEASUREMENTS.holderWidth, y: HOLDER_MEASUREMENTS.holderHeight };

    TILE_COLOURS = TILE_COLORS_CLASSIC;
    constructor(private theme: ThemesService) {}

    setGrids() {
        switch (this.theme.getActiveTheme()) {
            case classic:
                this.TILE_COLOURS = TILE_COLORS_CLASSIC;
                break;
            case inverted:
                this.TILE_COLOURS = TILE_COLORS_INVERTED;
                break;
            case green:
                this.TILE_COLOURS = TILE_COLORS_GREEN;
                break;
            case pink:
                this.TILE_COLOURS = TILE_COLORS_PINK;
                break;
            default:
        }
    }

    drawLetter(letter: string, position: number) {
        this.setGrids();
        const checkedLetter = this.validParams(letter, position);
        if (checkedLetter) {
            this.letterLog.set(position, checkedLetter);
        } else this.letterLog.delete(position);
    }
    /**mettre isValidLetter dans Valide Params apres */
    validParams(letter: string, position: number): string {
        if (HOLDER_MEASUREMENTS.minPositionHolder <= position && HOLDER_MEASUREMENTS.maxPositionHolder >= position) {
            return this.isValidLetter(letter);
        } else return '';
    }

    isValidLetter(letter:string){
        if (letter >= 'A' && letter <= 'Z') return letter;
            else if (letter === 'blank') return 'BLANK';
            else if (letter >= 'a' && letter <= 'z') return letter.toUpperCase();
            else return '';
    }

    getHolderHandPoints(letter:string){
        const letterHolder = this.isValidLetter(letter);
        if(letterHolder){
            return  LETTER_POINTS[letterHolder as keyof typeof LETTER_POINTS];
        }
        return 0;
    }


    setHolderState(holder: string[]) {
        this.holderState = holder;
        this.holderStatePoints = [];
        this.holderState.forEach((letter)=>{
            this.holderStatePoints.push(this.getHolderHandPoints(letter))
        })
    }

    addLetters() {
        // draws letters from the holder state directly
        for (let pos = 0; pos < this.holderState.length; pos++) {
            if (this.holderState[pos]) this.drawLetter(this.holderState[pos], pos + 1);
        }
    }

    redrawTiles() {
        // draws letters from letterlog (temporarily for 3s)
        Array.from(this.letterLog.keys()).forEach((key) => {
            const letter = this.letterLog.get(key);
            this.drawLetter(letter as string, key);
        });
    }

    getNewHolderStatePoints(): Subject<number[]> {
        return this.subjectHolderStatePoints;
    }

    drawTypedLetters(letters: string[]) {
        this.holderStatePoints = [];
        letters.forEach((letter)=>{
            this.holderStatePoints.push(this.getHolderHandPoints(letter))
        })
        this.getNewHolderStatePoints().next(this.holderStatePoints)
        const previousState = this.holderState;
        this.holderState = letters;
        this.addLetters();
        this.holderState = previousState;
    }

    redrawLetter(position: number) {
        const letter = this.letterLog.get(position);
        if (letter) this.drawLetter(letter, position);
    }

    removeSelection(position: number) {
        this.redrawLetter(position);
    }
    /**on tentera de changer de position */
    changePositionPoints(oldPosition: number, newPosition: number){
        const savedPosition = this.holderStatePoints[oldPosition - 1];
        this.holderStatePoints[oldPosition - 1] = this.holderStatePoints[newPosition - 1];
        this.holderStatePoints[newPosition - 1] = savedPosition
    }

    changePosition(oldPosition: number, newPosition: number) {
        const lettersPosition = this.letterLog;
        const letterToMove = lettersPosition.get(oldPosition);
        const letterToChange = lettersPosition.get(newPosition);
        lettersPosition.delete(oldPosition);
        lettersPosition.delete(newPosition);

        if (letterToMove && letterToChange) {
            lettersPosition.set(newPosition, letterToMove);
            lettersPosition.set(oldPosition, letterToChange);
            this.changePositionPoints(oldPosition,newPosition);
            const newLettersMap = new Map([...lettersPosition.entries()].sort(([key1], [key2]) => key1 - key2));
            this.letterLog = newLettersMap;

            this.redrawTiles();
        }
    }

    get width(): number {
        return this.holderSize.x;
    }

    get height(): number {
        return this.holderSize.y;
    }
}
