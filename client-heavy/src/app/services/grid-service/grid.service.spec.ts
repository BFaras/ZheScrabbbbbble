/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { COLUMNS, GRID_CONSTANTS, GRID_OFFSETS, ROWS } from '@app/constants/grid-constants';
import { GridService } from '@app/services/grid-service/grid.service';

describe('GridService', () => {
    let service: GridService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 800;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GridService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
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

    it(' drawIdentificators should call fillText 30 times on the canvas', () => {
        const expectedCallTimes = 30;
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawIdentificators();
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawSquares should call drawSquare 61 times for the 61 special tiles', () => {
        const expectedCallTimes = 61;
        const drawSquareSpy = spyOn(service, 'drawSquare').and.callThrough();
        service.drawSquares();
        expect(drawSquareSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawSquares should call fillRect 225 times on the canvas', () => {
        const expectedCallTimes = 225;
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        service.drawSquares();
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawSquares should call fillText 61 times on the canvas', () => {
        const expectedCallTimes = 121;
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawSquares();
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawGridLines should call moveTo and lineTo 32 times on the canvas', () => {
        const expectedCallTimes = 32;
        const moveToSpy = spyOn(service.gridContext, 'moveTo').and.callThrough();
        const lineToSpy = spyOn(service.gridContext, 'lineTo').and.callThrough();
        service.drawGridLines();
        expect(moveToSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(lineToSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawLetter should call fillText twice as much as fillRect on the canvas if all the parameters are valid', () => {
        const column = 3;
        const row = 'H';
        const letter = 'A';
        const expectedCallTimes = 1;
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetter(column, row, letter);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes * 2);
    });

    it(' drawLetter should call fillText and fillRect on the canvas even if the letter is small case', () => {
        const column = 3;
        const row = 'H';
        const smallLetter = 'p';
        const expectedCallTimes = 1;
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetter(column, row, smallLetter);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes * 2);
    });

    it(' drawLetter should call fillText and fillRect on the canvas even if the letter is blank', () => {
        const column = 3;
        const row = 'H';
        const blankLetter = 'blank' + 'p';
        const expectedCallTimes = 1;
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetter(column, row, blankLetter);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes * 2);
    });

    it(' drawLetter should not call fillText and fillRect on the canvas if the column is not on the board', () => {
        const negativeColumn = -5;
        const greaterColumn = 17;
        const nanColumn = NaN;
        const row = 'H';
        const letter = 'A';
        const expectedCallTimes = 0;
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetter(negativeColumn, row, letter);
        service.drawLetter(greaterColumn, row, letter);
        service.drawLetter(nanColumn, row, letter);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawLetter should not call fillText and fillRect on the canvas if the row is not on the board', () => {
        const notALetterRow = '%';
        const greaterRow = 'R';
        const column = 4;
        const letter = 'A';
        const expectedCallTimes = 0;
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetter(column, notALetterRow, letter);
        service.drawLetter(column, greaterRow, letter);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawLetter should call fillText and fillRect on the canvas if the row is small case', () => {
        const smallRow = 'o';
        const column = 4;
        const letter = 'A';
        const expectedCallTimes = 1;
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetter(column, smallRow, letter);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes * 2);
    });

    it(' drawLetter should not call fillText and fillRect on the canvas if the string parameter is not a letter', () => {
        const column = 3;
        const row = 'H';
        const notALetter = '$';
        const expectedCallTimes = 0;
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.callThrough();
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetter(column, row, notALetter);
        expect(fillRectSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(fillTextSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it(' drawLetter should color pixels on the canvas', () => {
        const column = 3;
        const row = 'H';
        const letter = 'A';
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawLetter(column, row, letter);
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' drawSquares should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawSquares();
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' drawGridLines should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGridLines();
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' drawIdentificators should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawIdentificators();
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' deleteAndRedraw should call clearRect, drawSquares and drawGridLines once', () => {
        const board: string[][] = [
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', 't', 'e', 's', 't', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ];
        service.setBoardState(board);
        const clearRectSpy = spyOn(service.gridContext, 'clearRect').and.callThrough();
        const drawSquaresSpy = spyOn(service, 'drawSquares').and.callThrough();
        const drawGridLinesSpy = spyOn(service, 'drawGridLines').and.callThrough();
        service.deleteAndRedraw();
        expect(clearRectSpy).toHaveBeenCalledTimes(1);
        expect(drawSquaresSpy).toHaveBeenCalledTimes(1);
        expect(drawGridLinesSpy).toHaveBeenCalledTimes(1);
    });

    it(' deleteAndRedraw should call drawLetter n times, n being the number of letters in the board', () => {
        const board: string[][] = [
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', 't', 'e', 's', 't', '2', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ];
        service.setBoardState(board);
        const n = 5;
        const drawLettersSpy = spyOn(service, 'drawLetter').and.callThrough();
        service.deleteAndRedraw();
        expect(drawLettersSpy).toHaveBeenCalledTimes(n);
    });

    it(' deleteAndRedraw should call drawLetter and strokeRect n times, n being the number of letters in addedLettersLog', () => {
        const addedLettersLog = new Map<string, string>();
        const letters = ['h', 'e', 'l', 'l', 'O'];
        const positions = ['H8', 'H9', 'H10', 'H11', 'H12'];
        positions.forEach((pos, i) => addedLettersLog.set(pos, letters[i]));
        const n = addedLettersLog.size;
        const drawLettersSpy = spyOn(service, 'drawLetter').and.callThrough();
        const strokeRectSpy = spyOn(service.gridContext, 'strokeRect').and.callThrough();
        service.deleteAndRedraw(addedLettersLog);
        expect(drawLettersSpy).toHaveBeenCalledTimes(n);
        expect(strokeRectSpy).toHaveBeenCalledTimes(n);
    });

    it(' deleteAndRedraw should not call drawLetter and strokeRect if addedLettersLog is empty', () => {
        const addedLettersLog = new Map<string, string>();
        const drawLettersSpy = spyOn(service, 'drawLetter').and.callThrough();
        const strokeRectSpy = spyOn(service.gridContext, 'strokeRect').and.callThrough();
        service.deleteAndRedraw(addedLettersLog);
        expect(drawLettersSpy).toHaveBeenCalledTimes(0);
        expect(strokeRectSpy).toHaveBeenCalledTimes(0);
    });

    it(' highlightCoords should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.highlightCoords(8, 'H');
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' addArrow should draw a horizontal arrow if parameter is true', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText');
        service.addArrow(8, 'H', true);
        expect(fillTextSpy).toHaveBeenCalledWith(
            service.horizontalArrow,
            COLUMNS[8] + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.arrowH,
            ROWS.H + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.arrowV,
        );
    });

    it(' addArrow should draw a vertical arrow if parameter is true', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText');
        service.addArrow(8, 'H', false);
        expect(fillTextSpy).toHaveBeenCalledWith(
            service.verticalArrow,
            COLUMNS[8] + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.arrowH,
            ROWS.H + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.arrowV,
        );
    });

    it(' addArrow should draw a horizontal arrow if parameter is true', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText');
        service.addArrow(8, 'H', true);
        expect(fillTextSpy).toHaveBeenCalledWith(
            service.horizontalArrow,
            COLUMNS[8] + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.arrowH,
            ROWS.H + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.arrowV,
        );
    });

    it(' addArrow should draw a vertical arrow if parameter is true', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.highlightCoords(8, 'H');
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });
});
