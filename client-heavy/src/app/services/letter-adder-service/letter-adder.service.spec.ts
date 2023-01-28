/* eslint-disable max-len */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { GRID_CONSTANTS } from '@app/constants/grid-constants';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { LetterAdderService } from './letter-adder.service';

describe('LetterAdderService', () => {
    let service: LetterAdderService;
    let letterHolderService: jasmine.SpyObj<LetterHolderService>;
    let chatService: ChatService;
    let gridService: jasmine.SpyObj<GridService>;

    beforeEach(() => {
        const gridServiceSpy = jasmine.createSpyObj('GridService', ['drawLetter', 'deleteAndRedraw', 'highlightCoords', 'addArrow']);
        const letterHolderServiceSpy = jasmine.createSpyObj('LetterHolderService', ['drawTypedLetters']);
        TestBed.configureTestingModule({
            providers: [
                GridService,
                { provide: GridService, useValue: gridServiceSpy },
                LetterHolderService,
                { provide: LetterHolderService, useVlaue: letterHolderServiceSpy },
            ],
        });
        service = TestBed.inject(LetterAdderService);
        chatService = TestBed.inject(ChatService);
        letterHolderService = TestBed.inject(LetterHolderService) as jasmine.SpyObj<LetterHolderService>;
        gridService = TestBed.inject(GridService) as jasmine.SpyObj<GridService>;
        service.boardState = [
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
        service.mapBoardState();
        service.setPlayerHand([]);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' findCoords should return the correct coordinates on the table when you click on the corners', () => {
        const bottomRightCornerCoords = service.findCoords(GRID_CONSTANTS.defaultWidth - 1, GRID_CONSTANTS.defaultHeight - 1);
        expect(bottomRightCornerCoords.column).toEqual(15);
        expect(bottomRightCornerCoords.row).toEqual('O');
        const bottomLeftCornerCoords = service.findCoords(GRID_CONSTANTS.defaultSide + 1, GRID_CONSTANTS.defaultHeight - 1);
        expect(bottomLeftCornerCoords.column).toEqual(1);
        expect(bottomLeftCornerCoords.row).toEqual('O');
        const topRightCorner = service.findCoords(GRID_CONSTANTS.defaultWidth - 1, GRID_CONSTANTS.defaultSide + 1);
        expect(topRightCorner.column).toEqual(15);
        expect(topRightCorner.row).toEqual('A');
        const topLeftCorner = service.findCoords(GRID_CONSTANTS.defaultSide + 1, GRID_CONSTANTS.defaultSide + 1);
        expect(topLeftCorner.column).toEqual(1);
        expect(topLeftCorner.row).toEqual('A');
    });

    it(' findCoords should return the right column and row when you click on the playable area', () => {
        const randomTile1 = service.findCoords(435, 679);
        expect(randomTile1.column).toEqual(8);
        expect(randomTile1.row).toEqual('M');
        const randomTile2 = service.findCoords(199, 745);
        expect(randomTile2.column).toEqual(3);
        expect(randomTile2.row).toEqual('N');
    });

    it(' findCoords should call checkClickValidity once', () => {
        const checkAvailabilitySpy = spyOn(service, 'checkClickValidity').and.callThrough();
        service.findCoords(500, 500);
        expect(checkAvailabilitySpy).toHaveBeenCalledTimes(1);
    });

    it(' findCoords should return valid = true if the click was on the playable board', () => {
        for (let x = GRID_CONSTANTS.defaultSide + 1; x < GRID_CONSTANTS.defaultWidth; x++) {
            for (let y = GRID_CONSTANTS.defaultSide + 1; y < GRID_CONSTANTS.defaultHeight; y++) {
                const tile = service.findCoords(x, y);
                expect(tile.valid).toBeTruthy();
            }
        }
    });

    it(' findCoords should return valid = false if the click was outside the playable area', () => {
        for (let x = 0; x <= GRID_CONSTANTS.defaultWidth; x++) {
            for (let y = 0; y <= GRID_CONSTANTS.defaultSide; y++) {
                const tile = service.findCoords(x, y);
                expect(tile.valid).toBeFalsy();
            }
        }
        for (let x = 0; x <= GRID_CONSTANTS.defaultSide; x++) {
            for (let y = GRID_CONSTANTS.defaultSide + 1; y <= GRID_CONSTANTS.defaultHeight; y++) {
                const tile = service.findCoords(x, y);
                expect(tile.valid).toBeFalsy();
            }
        }
    });

    it(' simplifyLetter should remove the accent from a letter', () => {
        const letters = ['é', 'ê', 'ë', 'è', 'à', 'â', 'ä', 'ù', 'û', 'ô', 'ö', 'î', 'ï', 'ç'];
        let sum = '';
        letters.forEach((letter) => (sum += service.simplifyLetter(letter)));
        expect(sum).toEqual('eeeeaaauuooiic');
    });

    it(' simplifyLetter should return the parameter if it does not match any case', () => {
        const letters = ['a', 'e', 'u', 'o', 'i', 'c', 'p', '%', '?', '2', ''];
        let sum = '';
        letters.forEach((letter) => (sum += service.simplifyLetter(letter)));
        expect(sum).toEqual('aeuoicp%?2');
    });

    it(' formatAddedLetters should give a command in the format row + column + direction + letters added', () => {
        const letters = ['h', 'e', 'l', 'l', 'O'];
        const positions = ['H8', 'H9', 'H10', 'H11', 'H12'];
        service.arrowDirection = true;
        positions.forEach((pos, i) => service.addedLettersLog.set(pos, letters[i]));
        expect(service.formatAddedLetters()).toEqual('h8h hellO');
        service.arrowDirection = false;
        expect(service.formatAddedLetters()).toEqual('h8v hellO');
    });

    it(' formatAddedLetters should not be called if addedLettersLog is empty', () => {
        const formatLettersSpy = spyOn(service, 'formatAddedLetters').and.callThrough();
        service.makeMove();
        expect(formatLettersSpy).toHaveBeenCalledTimes(0);
    });

    it(' formatAddedLetters should transform a blank letter into a capital letter', () => {
        service.addedLettersLog.set('A1', 'blanka');
        const string = service.formatAddedLetters();
        expect(service.addedLettersLog.get('A1')).toEqual('A');
        expect(string.includes('A')).toBeTruthy();
    });

    it(' isLetterBlank should handle a blank letter with an accent the same as one without an accent', () => {
        expect(service.isLetterBlank('A')).toEqual('blanka');
        expect(service.isLetterBlank('Ä')).toEqual('blanka');
    });

    it(' isLetterBlank should return an empty string if the letter is lower case', () => {
        expect(service.isLetterBlank('e')).toBeFalsy();
        expect(service.isLetterBlank('é')).toBeFalsy();
    });

    it(' isLetterBlank should return an empty string if the parameter has more than one character or is not a letter', () => {
        expect(service.isLetterBlank('Shift')).toBeFalsy();
        expect(service.isLetterBlank('%')).toBeFalsy();
    });

    it(' isInBounds should return false if the active square is outside the playable area', () => {
        service.activeSquare.x = String.fromCharCode('A'.charCodeAt(0) - 1);
        for (let col = 0; col <= 16; col++) {
            service.activeSquare.y = col;
            expect(service.isInBounds()).toBeFalsy();
            if (col === 16 && service.activeSquare.x === '@') {
                service.activeSquare.x = String.fromCharCode('O'.charCodeAt(0) + 1);
                col = 0;
            }
        }
        service.activeSquare.y = 0;
        for (let row = 0; row < 15; row++) {
            service.activeSquare.x = String.fromCharCode('A'.charCodeAt(0) + row);
            expect(service.isInBounds()).toBeFalsy();
            if (row === 14 && service.activeSquare.x === '@') {
                service.activeSquare.y = 16;
                row = 0;
            }
        }
    });

    it(' isInBounds should return true if the active square is inside the playable area', () => {
        for (let row = 0; row < 15; row++) {
            service.activeSquare.x = String.fromCharCode('A'.charCodeAt(0) + row);
            for (let col = 1; col <= 15; col++) {
                service.activeSquare.y = col;
                expect(service.isInBounds()).toBeTruthy();
            }
        }
    });

    it(' isPositionTaken should return false if no letter is found at a specific position', () => {
        service.activeSquare = { x: 'A', y: 1 };
        expect(service.isPositionTaken()).toBeFalsy();
        service.activeSquare = { x: 'N', y: 9 };
        expect(service.isPositionTaken()).toBeFalsy();
    });

    it(' isPositionTaken should return true if there is a letter at a specific position', () => {
        service.activeSquare = { x: 'H', y: 6 };
        expect(service.isPositionTaken()).toBeTruthy();
        service.activeSquare = { x: 'H', y: 9 };
        expect(service.isPositionTaken()).toBeTruthy();
    });

    it(' inLetterHolder should return true if the letter is in the letter holder', () => {
        service.setPlayerHand(['a', 'b', 'c', 'd', 'e', 'f', 'blank']);
        service.key = 'a';
        expect(service.inPlayerHand()).toBeTruthy();
        service.key = 'blankg';
        expect(service.inPlayerHand()).toBeTruthy();
    });

    it(' inLetterHolder should return false if the letter is not in the letter holder', () => {
        service.setPlayerHand(['a', 'b', 'c', 'd', 'e', 'f', 'blank']);
        service.key = 'v';
        expect(service.inPlayerHand()).toBeFalsy();
        service.key = 'Capslock';
        expect(service.inPlayerHand()).toBeFalsy();
    });

    it(' addToHand should add a letter to the playerHand and remove a letter from addedLettersLog when the parameter is true ', () => {
        service.key = 'a';
        const drawLettersSpy = spyOn(letterHolderService, 'drawTypedLetters');
        service.addedLettersLog.set('H8', service.key);
        service.playerHand = [];
        service.addToHand(true);
        expect(drawLettersSpy).toHaveBeenCalled();
        expect(service.playerHand.length).toEqual(1);
        expect(service.addedLettersLog.size).toEqual(0);
    });

    it(' addToHand should remove a letter from the playerHand and add a letter to addedLettersLog when the parameter is false ', () => {
        const drawLettersSpy = spyOn(letterHolderService, 'drawTypedLetters');
        service.key = 'a';
        service.setPlayerHand([service.key]);
        service.activeSquare = { x: 'H', y: 8 };
        service.addToHand(false);
        expect(drawLettersSpy).toHaveBeenCalled();
        expect(service.playerHand.length).toEqual(0);
        expect(service.addedLettersLog.size).toEqual(1);
    });

    it(' addToHand should only add blank to the playerHand if the letter is blank ', () => {
        const drawLettersSpy = spyOn(letterHolderService, 'drawTypedLetters');
        service.key = 'blanka';
        service.addedLettersLog.set('H8', service.key);
        service.setPlayerHand(['a', 'b', 'c', 'd', 'e', 'f']);
        service.addToHand(true);
        expect(drawLettersSpy).toHaveBeenCalled();
        expect(service.playerHand.includes('blank')).toBeTruthy();
        expect(service.playerHand.includes('blanka')).toBeFalsy();
    });

    it(' addToHand should remove blank from the playerHand and add blank + key to the addedLettersLog if the letter is blank ', () => {
        const drawLettersSpy = spyOn(letterHolderService, 'drawTypedLetters');
        service.activeSquare = { x: 'H', y: 3 };
        service.key = 'blanka';
        service.setPlayerHand(['a', 'b', 'c', 'd', 'e', 'blank']);
        service.addToHand(false);
        expect(drawLettersSpy).toHaveBeenCalled();
        expect(service.playerHand.includes('blank')).toBeFalse();
        expect(service.addedLettersLog.get('H3')).toEqual('blanka');
    });

    it(' removeAll should call removeLetters n times, n being the size of addedLettersLog', () => {
        const removeLettersSpy = spyOn(service, 'removeLetters');
        const letters = ['h', 'e', 'l', 'l', 'blanko'];
        const positions = ['I6', 'I7', 'I8', 'I9', 'I10'];
        positions.forEach((pos, i) => service.addedLettersLog.set(pos, letters[i]));
        gridService.deleteAndRedraw.and.callThrough();
        service.removeAll();
        expect(removeLettersSpy).toHaveBeenCalledTimes(5);
    });

    it(" removeLetters should not react if addedLettersLog's size is 0", () => {
        service.activeSquare = { x: 'X', y: 2 };
        const changePositionSpy = spyOn(service, 'changeActivePosition');
        service.removeLetters();
        expect(changePositionSpy).toHaveBeenCalledTimes(0);
    });

    it(' removeLetters should directly remove letters if the position is not taken', () => {
        const addToHandSpy = spyOn(service, 'addToHand');
        service.addedLettersLog.set('H5', 'f');
        service.activeSquare = { x: 'H', y: 5 };
        service.removeLetters();
        expect(addToHandSpy).toHaveBeenCalledWith(true);
    });

    it(' removeLetters should remove letters from addedLettersLog if the size is greater than 0', () => {
        const letters = ['h', 'e', 'l', 'l', 'blanko'];
        const positions = ['I6', 'I7', 'I8', 'I9', 'I10'];
        positions.forEach((pos, i) => service.addedLettersLog.set(pos, letters[i]));
        const addToHandSpy = spyOn(service, 'addToHand');
        service.removeLetters();
        expect(addToHandSpy).toHaveBeenCalledWith(true);
    });

    it(' removeLetters should skip the letters already on the board', () => {
        const addToHandSpy = spyOn(service, 'addToHand').and.callThrough();
        const changePositionSpy = spyOn(service, 'changeActivePosition').and.callThrough();
        const letters = ['h', 'e', 'l', 'l', 'o'];
        const positions = ['H4', 'H5', 'H10', 'H11', 'H12'];
        positions.forEach((pos, i) => service.addedLettersLog.set(pos, letters[i]));
        service.activeSquare = { x: 'H', y: 13 };
        for (let i = 0; i < 5; i++) {
            service.removeLetters();
        }
        expect(service.activeSquare.x).toEqual('H');
        expect(service.activeSquare.y).toEqual(4);
        expect(addToHandSpy).toHaveBeenCalledTimes(5);
        expect(changePositionSpy).toHaveBeenCalledTimes(9);
    });

    it(" removeLetters should call addArrowSquare if addedLettersLog's size does not become 0", () => {
        const addArrowSquareSpy = spyOn(service, 'addArrowSquare');
        service.addedLettersLog.set('H4', 'f');
        service.addedLettersLog.set('H5', 'f');
        service.removeLetters();
        expect(addArrowSquareSpy).toHaveBeenCalled();
    });

    it(" removeLetters should call resetLetters if addedLettersLog's size becomes 0", () => {
        const resetLettersSpy = spyOn(service, 'resetLetters');
        const drawLettersSpy = spyOn(letterHolderService, 'drawTypedLetters');
        service.key = 'a';
        service.addedLettersLog.set('O4', 'f');
        service.removeLetters();
        expect(resetLettersSpy).toHaveBeenCalled();
        expect(drawLettersSpy).toHaveBeenCalled();
    });

    it(' changeActivePosition should increase the position horizontally if the arrowDirection is true and the parameter is 1', () => {
        service.activeSquare = { x: 'H', y: 8 };
        service.arrowDirection = true;
        service.setPlayerHand([]);
        service.changeActivePosition(1);
        expect(service.activeSquare.x).toEqual('H');
        expect(service.activeSquare.y).toEqual(9);
    });

    it(' changeActivePosition should increase the position vertically if the arrowDirection is false and the parameter is 1', () => {
        service.activeSquare = { x: 'H', y: 8 };
        service.arrowDirection = false;
        service.changeActivePosition(1);
        expect(service.activeSquare.x).toEqual('I');
        expect(service.activeSquare.y).toEqual(8);
    });

    it(' changeActivePosition should decrease the position horizontally if the arrowDirection is true and the parameter is -1', () => {
        service.activeSquare = { x: 'H', y: 8 };
        service.arrowDirection = true;
        service.changeActivePosition(-1);
        expect(service.activeSquare.x).toEqual('H');
        expect(service.activeSquare.y).toEqual(7);
    });

    it(' changeActivePosition should decrease the position vertically if the arrowDirection is false and the parameter is -1', () => {
        service.activeSquare = { x: 'H', y: 8 };
        service.arrowDirection = false;
        service.changeActivePosition(-1);
        expect(service.activeSquare.x).toEqual('G');
        expect(service.activeSquare.y).toEqual(8);
    });

    it(' onPressDown should call removeLetters if the key was Backspace', () => {
        const removeLettersSpy = spyOn(service, 'removeLetters');
        service.onPressDown('Backspace');
        expect(removeLettersSpy).toHaveBeenCalled();
    });

    it(' onPressDown should call makeMove if the key was Enter', () => {
        const makeMoveSpy = spyOn(service, 'makeMove');
        service.onPressDown('Enter');
        expect(makeMoveSpy).toHaveBeenCalled();
    });

    it(' onPressDown should call removeAll if the key was Escape', () => {
        const removeAllSpy = spyOn(service, 'removeAll');
        service.onPressDown('Escape');
        expect(removeAllSpy).toHaveBeenCalled();
    });

    it(' onPressDown should call addLetters if the key was not Escape, Backspace or Enter', () => {
        const addLettersSpy = spyOn(service, 'addLetters');
        service.onPressDown('a');
        expect(addLettersSpy).toHaveBeenCalled();
    });

    it(' makeMove should call sendService and removeAll if addedLettersLog is not empty', () => {
        const sendCommandSpy = spyOn(chatService, 'sendCommand');
        const removeAllSpy = spyOn(service, 'removeAll');
        service.addedLettersLog.set('H8', 'a');
        service.makeMove();
        expect(sendCommandSpy).toHaveBeenCalled();
        expect(removeAllSpy).toHaveBeenCalled();
    });

    it(" canClick should return true if addedLettersLog is empty, it's the player's turn, the position isn't taken and the click was in the board", () => {
        service.setCanPlay(false);
        const result = service.canClick({ x: 799, y: 799 });
        expect(result).toBeTruthy();
    });

    it(' canClick should not change the activeSquare position if the addedLettersLog size is not 0', () => {
        service.activeSquare = { x: 'H', y: 3 };
        service.addedLettersLog.set('H8', 'a');
        service.canClick({ x: 799, y: 799 });
        expect(service.activeSquare.x).toEqual('H');
        expect(service.activeSquare.y).toEqual(3);
    });

    it(' addLetters should see the difference between a blank letter and a normal letter', () => {
        service.setPlayerHand([]);
        service.addLetters('A');
        expect(service.key).toEqual('blanka');
        service.addLetters('a');
        expect(service.key).toEqual('a');
    });

    it(' addLetters should not react if the key in not in the playerHand or if the activeSquare is out of bounds', () => {
        const addArrowSquareSpy = spyOn(service, 'addArrowSquare');
        service.setPlayerHand([]);
        service.activeSquare = { x: 'P', y: 0 };
        service.addLetters('a');
        expect(addArrowSquareSpy).toHaveBeenCalledTimes(0);
    });

    it(" addLetters should directly add the letters from the player's hand on the board if the position is not taken", () => {
        const addToHandSpy = spyOn(service, 'addToHand').and.callThrough();
        const drawLettersSpy = spyOn(letterHolderService, 'drawTypedLetters');
        service.setPlayerHand(['a']);
        service.activeSquare = { x: 'I', y: 8 };
        service.addLetters('a');
        expect(drawLettersSpy).toHaveBeenCalled();
        expect(addToHandSpy).toHaveBeenCalledWith(false);
    });

    it(' addLetters should skip tiles until the position is not taken ', () => {
        const changePositionSpy = spyOn(service, 'changeActivePosition').and.callThrough();
        service.setPlayerHand(['a']);
        service.activeSquare = { x: 'H', y: 6 };
        service.addLetters('a');
        expect(changePositionSpy).toHaveBeenCalledTimes(service.mappedBoardState.size);
        expect(service.activeSquare.y).toEqual(service.mappedBoardState.size + 6);
    });

    it(' onLeftClick should switch the arrow direction if the click was on the same position ', () => {
        service.setCanPlay(false);
        service.arrowDirection = true;
        service.onLeftClick({ x: 700, y: 700 });
        service.onLeftClick({ x: 700, y: 700 });
        expect(service.arrowDirection).toBeFalsy();
        service.onLeftClick({ x: 700, y: 700 });
        expect(service.arrowDirection).toBeTruthy();
    });

    it(' onLeftClick should reset the arrow direction to horizontal when you click on a different position ', () => {
        service.setCanPlay(false);
        service.arrowDirection = true;
        service.onLeftClick({ x: 700, y: 700 });
        service.onLeftClick({ x: 700, y: 700 });
        expect(service.arrowDirection).toBeFalsy();
        service.onLeftClick({ x: 200, y: 200 });
        expect(service.arrowDirection).toBeTruthy();
    });

    it(' resetMappedBoard should clear the mapped board state ', () => {
        const letters = ['h', 'e', 'l', 'l', 'o'];
        const positions = ['H4', 'H5', 'H10', 'H11', 'H12'];
        positions.forEach((pos, i) => service.addedLettersLog.set(pos, letters[i]));
        service.mapBoardState();
        service.resetMappedBoard();
        expect(service.mappedBoardState.size).toBeFalsy();
    });
});
