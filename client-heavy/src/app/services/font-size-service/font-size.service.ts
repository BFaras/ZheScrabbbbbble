import { Injectable } from '@angular/core';
import { DEFAULT_SIZES } from '@app/constants/font-size-constants';

@Injectable({
    providedIn: 'root',
})
export class FontSizeService {
    clickCount: number = 0;
    private fontSize = new Map<string, number>();

    constructor() {
        this.fontSize.set('gridLettersSize', DEFAULT_SIZES.gridLettersSize);
        this.fontSize.set('gridPointSize', DEFAULT_SIZES.gridPointSize);
        this.fontSize.set('tileLetterSize', DEFAULT_SIZES.tileLetterSize);
        this.fontSize.set('tilePointSize', DEFAULT_SIZES.tilePointSize);
    }

    getFontSize(): Map<string, number> {
        return this.fontSize;
    }

    increaseSize() {
        if (this.clickCount <= DEFAULT_SIZES.maxClicks) {
            const fontSizeKeys: string[] = Array.from(this.fontSize.keys());
            this.clickCount++;
            fontSizeKeys.forEach((key) => {
                let value = this.fontSize.get(key);
                if (value) {
                    value += 1;
                    this.fontSize.set(key, value);
                }
            });
        }
    }

    decreaseSize() {
        if (this.clickCount > DEFAULT_SIZES.minClicks) {
            const fontSizeKeys: string[] = Array.from(this.fontSize.keys());
            this.clickCount--;
            fontSizeKeys.forEach((key) => {
                let value = this.fontSize.get(key);
                if (value) {
                    value -= 1;
                    this.fontSize.set(key, value);
                }
            });
        }
    }
}
