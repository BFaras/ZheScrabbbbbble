/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { LetterHolderService } from './letter-holder.service';

describe('LetterHolderService', () => {
    let service: LetterHolderService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 480;
    const CANVAS_HEIGHT = 60;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LetterHolderService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.holderContext = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' width should return the width of the grid canvas', () => {
        expect(service.width).toEqual(CANVAS_WIDTH);
    });

    it(' height should return the height of the grid canvas', () => {
        expect(service.height).toEqual(CANVAS_HEIGHT);
    });

    it(' drawLetter should call fillText twice as much as fillRect on the canvas if all the parameters are valid and the letter is not blank', () => {
        const position = 3;
        const letter = 'A';
        const expectedCallTimes = 1;
        const fillRectSpy = spyOn(service.holderContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.holderContext, 'fillText').and.callThrough();
        service.drawLetter(letter, position);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes * 2);
    });

    it(' drawLetter should call fillText and fillRect on the canvas even if the letter is small case', () => {
        const position = 3;
        const smallLetter = 'p';
        const expectedCallTimes = 1;
        const fillRectSpy = spyOn(service.holderContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.holderContext, 'fillText').and.callThrough();
        service.drawLetter(smallLetter, position);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes * 2);
    });

    it(' drawLetter should not call fillText, but should call fillRect on the canvas if the letter is blank', () => {
        const position = 3;
        const blankLetter = 'blank';
        const expectedCallTimes = 0;
        const fillRectSpy = spyOn(service.holderContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.holderContext, 'fillText').and.callThrough();
        service.drawLetter(blankLetter, position);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes + 1);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' an element at a specified position should be removed from the letterLog if replaced by an empty string', () => {
        const position = 7;
        const letter = 'A';
        const emptyString = '';
        service.drawLetter(letter, position);
        const letterLogSizeBefore = service.letterLog.size;
        service.drawLetter(emptyString, position);
        const letterLogSizeAfter = service.letterLog.size;
        expect(letterLogSizeBefore).toBe(1);
        expect(letterLogSizeAfter).toBe(0);
    });

    it(' drawLetter should not call fillText and fillRect on the canvas if the string parameter is not a letter or an empty string', () => {
        const position = 3;
        const notALetter = '$';
        const emptyString = '';
        const expectedCallTimes = 0;
        const fillRectSpy = spyOn(service.holderContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.holderContext, 'fillText').and.callThrough();
        service.drawLetter(notALetter, position);
        service.drawLetter(emptyString, position);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawLetter should be called n times, n being the amount of letters in the boardState', () => {
        const holderState = ['A', 'B', 'C', '', 'E', 'F', 'G'];
        const expectedCallTimes = 6;
        const drawLetterSpy = spyOn(service, 'drawLetter').and.callThrough();
        service.setHolderState(holderState);
        service.addLetters();
        expect(drawLetterSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawLetter should not call fillText and fillRect on the canvas if the position is not on the rack', () => {
        const lowerPosition = -1;
        const greaterPosition = 10;
        const nanPosition = NaN;
        const letter = 'A';
        const expectedCallTimes = 0;
        const fillRectSpy = spyOn(service.holderContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.holderContext, 'fillText').and.callThrough();
        service.drawLetter(letter, lowerPosition);
        service.drawLetter(letter, greaterPosition);
        service.drawLetter(letter, nanPosition);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' reDrawTiles should respectively call drawLetter and clearRect n times, n being the size of letterLog', () => {
        service.drawLetter('B', 4);
        service.drawLetter('F', 5);
        service.drawLetter('M', 6);
        service.drawLetter('J', 7);
        const n = service.letterLog.size;
        const drawLettersSpy = spyOn(service, 'drawLetter').and.callThrough();
        service.redrawTiles();
        expect(drawLettersSpy).toHaveBeenCalledTimes(n);
    });

    it(' reDrawLetters should not call drawLetter for keys in letterLog that have an empty string as a value', () => {
        service.drawLetter('', 4);
        const drawLettersSpy = spyOn(service, 'drawLetter').and.callThrough();
        service.redrawTiles();
        expect(drawLettersSpy).toHaveBeenCalledTimes(0);
    });

    it('reDrawLetter should call drawLetter and redraw a specific letter for its position', () => {
        service.drawLetter('A', 4);
        const drawLettersSpy = spyOn(service, 'drawLetter').and.callThrough();
        service.redrawLetter(4);
        expect(drawLettersSpy).toHaveBeenCalledTimes(1);
    });

    it('drawSelection should call fillRect and stroke to draw selection', () => {
        const dummyPosition = 5;
        const fillRectSpy = spyOn(service.holderContext, 'fillRect').and.callThrough();
        const strokeSpy = spyOn(service.holderContext, 'stroke').and.callThrough();
        service.drawSelection(dummyPosition);
        expect(fillRectSpy).toHaveBeenCalledTimes(1);
        expect(strokeSpy).toHaveBeenCalledTimes(1);
    });

    it('removeSelection should call clearRect and redrawLetter at a given position', () => {
        const dummyPosition = 5;
        const redrawLetterSpy = spyOn(service, 'redrawLetter').and.callThrough();
        const clearRectSpy = spyOn(service.holderContext, 'clearRect').and.callThrough();
        service.removeSelection(dummyPosition);
        expect(redrawLetterSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).toHaveBeenCalledTimes(1);
    });

    it('drawTypedLetters should call addLetters', () => {
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        service.setHolderState(['h', 'i', 'j', 'k', 'l', 'm', 'n']);
        const addLettersSpy = spyOn(service, 'addLetters').and.callThrough();
        service.drawTypedLetters(letters);
        expect(addLettersSpy).toHaveBeenCalledTimes(1);
    });

    it('should change position between two given positions', () => {
        service.setHolderState(['h', 'i', 'j', 'k', 'l', 'm', 'n']);
        service.addLetters();
        service.changePosition(1, 2);
        const map = new Map([
            [1, 'I'],
            [2, 'H'],
            [3, 'J'],
            [4, 'K'],
            [5, 'L'],
            [6, 'M'],
            [7, 'N'],
        ]);
        expect(service.letterLog).toEqual(map);
    });
});
