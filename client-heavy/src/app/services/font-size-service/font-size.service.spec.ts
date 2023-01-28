/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { FontSizeService } from './font-size.service';

describe('FontSizeService', () => {
    let service: FontSizeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FontSizeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('increaseSize and decraseSize should increase or decrease all font sizes by a maximum of 5 pixels', () => {
        const fontSizeKeys: string[] = Array.from(service.getFontSize().keys());
        // keep all the initial sizes to be able to compare them to the increased sizes later
        const initialSizes = new Map<string, number>();
        fontSizeKeys.forEach((key) => {
            const value = service.getFontSize().get(key);
            if (value) initialSizes.set(key, value);
        });
        // we try to increase it 10 times to show it will only increase it 5 times
        for (let i = 0; i < 10; i++) {
            service.increaseSize();
        }
        // increase the sizes and compare with the initial sizes
        const increasedSizes = service.getFontSize();
        fontSizeKeys.forEach((key) => {
            const increasedValue = increasedSizes.get(key);
            const initialValue = initialSizes.get(key);
            // check if the values are undefined or not because they are in a map
            if (increasedValue && initialValue) expect(increasedValue - initialValue).toEqual(5);
        });
        // decrease the now increased sizes
        // we try to decrease the increased size 10 times to show it will only be decreased 5 times
        for (let i = 0; i < 10; i++) {
            service.decreaseSize();
        }
        // we show that after 5 decreases the sizes are back to the initial ones
        fontSizeKeys.forEach((key) => {
            const decreasedValue = service.getFontSize().get(key);
            const initialValue = initialSizes.get(key);
            // check if the values are undefined or not  because they are in a map
            if (decreasedValue && initialValue) expect(decreasedValue).toEqual(initialValue);
        });
    });
});
