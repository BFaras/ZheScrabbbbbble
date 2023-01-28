import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DIRECTION, GRID_CONSTANTS } from '@app/constants/grid-constants';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';

@Injectable({
    providedIn: 'root',
})
export class LetterAdderService {
    arrowDirection: boolean = true;
    activeSquare: { x: string; y: number } = { x: 'P', y: 0 };
    prevActiveSquare: { x: string; y: number } = { x: 'P', y: 0 };
    addedLettersLog = new Map<string, string>();
    playerHand: string[];
    boardState: string[][];
    mappedBoardState = new Map<string, string>();
    key: string;
    canPlay: boolean;

    constructor(private letterHolderService: LetterHolderService, private gridService: GridService, private chatService: ChatService) {}

    onLeftClick(coords: Vec2) {
        if (this.canClick(coords)) {
            this.gridService.deleteAndRedraw();
            if (this.prevActiveSquare.x === this.activeSquare.x && this.prevActiveSquare.y === this.activeSquare.y)
                this.arrowDirection = !this.arrowDirection;
            else this.arrowDirection = true;
            this.addArrowSquare();
            this.prevActiveSquare = this.activeSquare;
        }
    }

    canClick(coords: Vec2): boolean {
        const foundCoords = this.findCoords(coords.x, coords.y);
        if (!this.addedLettersLog.size) this.activeSquare = { x: foundCoords.row, y: foundCoords.column };
        return this.canPlay && !this.addedLettersLog.size && foundCoords.valid && !this.isPositionTaken();
    }

    onPressDown(key: string) {
        switch (key) {
            case 'Backspace': {
                this.removeLetters();
                break;
            }
            case 'Enter': {
                this.makeMove();
                break;
            }
            case 'Escape': {
                this.removeAll();
                break;
            }
            default: {
                this.addLetters(key);
            }
        }
    }

    addLetters(key: string) {
        this.key = this.isLetterBlank(key) ? this.isLetterBlank(key) : this.simplifyLetter(key);
        if (this.inPlayerHand() && this.isInBounds()) {
            if (!this.isPositionTaken()) {
                this.addToHand(false);
                this.gridService.drawLetter(this.activeSquare.y, this.activeSquare.x, this.key);
                this.gridService.deleteAndRedraw(this.addedLettersLog);
                this.changeActivePosition(1);
            }
            while (this.isPositionTaken()) {
                this.changeActivePosition(1);
            }
            this.addArrowSquare();
        }
    }

    changeActivePosition(direction: number) {
        if (this.arrowDirection) {
            this.activeSquare.y += direction;
        } else {
            this.activeSquare.x = String.fromCharCode(this.activeSquare.x.charCodeAt(0) + direction);
        }
    }

    removeLetters() {
        const decrement = -1;
        if (!this.addedLettersLog.size) return;
        if (!this.isPositionTaken()) {
            this.addToHand(true);
            this.gridService.deleteAndRedraw(this.addedLettersLog);
            this.changeActivePosition(decrement);
        }
        while (this.isPositionTaken()) {
            this.changeActivePosition(decrement);
        }
        if (this.addedLettersLog.size) {
            this.addArrowSquare();
        } else {
            this.resetLetters();
        }
    }

    removeAll() {
        const size = this.addedLettersLog.size;
        if (size) {
            for (let i = 0; i < size; i++) {
                this.removeLetters();
            }
        }
        this.resetLetters();
    }

    resetLetters() {
        this.prevActiveSquare = { x: 'P', y: 0 };
        this.activeSquare = { x: 'P', y: 0 };
        this.gridService.deleteAndRedraw();
    }

    addToHand(addOrDel: boolean) {
        if (!this.key) return;
        let key = this.key;
        const remainingLetters: string[] = this.playerHand;
        const lastAddedLetter = Array.from(this.addedLettersLog)[this.addedLettersLog.size - 1];
        if (addOrDel) {
            this.addedLettersLog.delete(lastAddedLetter[0]);
            if (lastAddedLetter[1].length === 1) this.playerHand.push(lastAddedLetter[1]);
            else this.playerHand.push(lastAddedLetter[1].slice(0, GRID_CONSTANTS.lastLetter));
        } else {
            this.addedLettersLog.set(this.activeSquare.x + this.activeSquare.y, key);
            if (this.key.length > 1) key = this.key.slice(0, GRID_CONSTANTS.lastLetter);
            const letterIndex = this.playerHand.indexOf(key);
            this.playerHand.splice(letterIndex, 1);
        }
        this.playerHand = remainingLetters;
        this.letterHolderService.drawTypedLetters(this.playerHand);
    }

    setPlayerHand(playerHand: string[]) {
        this.playerHand = playerHand;
    }

    setBoardState(gameState: string[][]) {
        this.boardState = gameState;
    }

    resetMappedBoard() {
        if (this.mappedBoardState.size) this.mappedBoardState.clear();
    }

    mapBoardState() {
        for (let row = 0; row < this.boardState.length; row++) {
            for (let col = 0; col < this.boardState[row].length; col++) {
                if (this.boardState[row][col]) {
                    const rowString = String.fromCharCode('A'.charCodeAt(0) + row);
                    const column = col + 1;
                    this.mappedBoardState.set(rowString + column, this.boardState[row][col]);
                }
            }
        }
    }

    inPlayerHand(): boolean {
        let key = this.key;
        let isIn = false;
        this.playerHand.forEach((letter) => {
            if (key.slice(0, GRID_CONSTANTS.lastLetter) === 'blank') key = 'blank';
            if (letter === key) isIn = true;
        });
        return isIn;
    }

    isPositionTaken(): boolean {
        this.mapBoardState();
        const foundLetter = this.mappedBoardState.get(this.activeSquare.x + this.activeSquare.y);
        return Boolean(foundLetter);
    }

    isInBounds(): boolean {
        return (
            this.activeSquare.y !== 0 &&
            this.activeSquare.y <= GRID_CONSTANTS.rowColumnCount &&
            this.activeSquare.x.charCodeAt(0) <= 'O'.charCodeAt(0) &&
            this.activeSquare.x.charCodeAt(0) >= 'A'.charCodeAt(0)
        );
    }

    notBlank(letter: string): boolean {
        const notALetter = letter.toUpperCase() === letter.toLowerCase();
        return letter.length !== 1 || notALetter || (letter >= 'a'.charAt(0) && letter <= 'z'.charAt(0));
    }

    isLetterBlank(letter: string): string {
        const simplifiedLetter = this.simplifyLetter(letter);
        if (this.notBlank(simplifiedLetter)) return '';
        else return 'blank' + this.simplifyLetter(letter.toLowerCase());
    }

    setCanPlay(canPlay: boolean) {
        this.canPlay = !canPlay;
    }

    makeMove() {
        if (this.addedLettersLog.size) {
            this.chatService.sendCommand(this.formatAddedLetters(), 'Place');
            this.removeAll();
        }
    }

    formatAddedLetters(): string {
        const keys = Array.from(this.addedLettersLog.keys());
        keys.forEach((key) => {
            const value = this.addedLettersLog.get(key);
            if (value && value?.length > 1) this.addedLettersLog.set(key, value?.substring(value.length - 1).toUpperCase() as string);
        });
        const letters = Array.from(this.addedLettersLog.values()).join('');
        return keys[0].toLowerCase() + this.formatDirection() + ' ' + letters;
    }

    formatDirection(): string {
        return this.arrowDirection ? DIRECTION.Horizontal : DIRECTION.Vertical;
    }

    simplifyLetter(key: string): string {
        switch (key) {
            case 'é':
            case 'ê':
            case 'ë':
            case 'è':
                return 'e';
            case 'à':
            case 'â':
            case 'ä':
                return 'a';
            case 'ù':
            case 'û':
                return 'u';
            case 'ô':
            case 'ö':
                return 'o';
            case 'î':
            case 'ï':
                return 'i';
            case 'ç':
                return 'c';
            default:
                return key;
        }
    }

    checkClickValidity(pixelX: number, pixelY: number): boolean {
        return (
            pixelX > GRID_CONSTANTS.defaultSide &&
            pixelX < GRID_CONSTANTS.defaultWidth &&
            pixelY > GRID_CONSTANTS.defaultSide &&
            pixelY < GRID_CONSTANTS.defaultHeight
        );
    }

    findCoords(pixelX: number, pixelY: number): { valid: boolean; row: string; column: number } {
        const valid = this.checkClickValidity(pixelX, pixelY);
        const rowIndex = Math.floor(pixelY / GRID_CONSTANTS.defaultSide) - 1;
        const row = String.fromCharCode('A'.charCodeAt(0) + rowIndex);
        const column = Math.floor(pixelX / GRID_CONSTANTS.defaultSide);
        return { valid, row, column };
    }

    addArrowSquare() {
        this.gridService.highlightCoords(this.activeSquare.y, this.activeSquare.x);
        this.gridService.addArrow(this.activeSquare.y, this.activeSquare.x, this.arrowDirection);
    }
}
