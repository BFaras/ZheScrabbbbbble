import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DIRECTION, GRID_CONSTANTS } from '@app/constants/grid-constants';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { Subject } from 'rxjs';
import { PreviewPlayersActionService } from '../preview-players-action-service/preview-players-action.service';
@Injectable({
    providedIn: 'root',
})
export class LetterAdderService {
    arrowDirection: boolean = true;
    activeSquare: { x: string; y: number } = { x: 'P', y: 0 };
    prevActiveSquare: { x: string; y: number } = { x: 'P', y: 0 };
    pervForDrag: { x: string; y: number; text: string } = { x: 'P', y: 0, text: "" };
    droppedSpotDrag: { x: string; y: number } = { x: 'P', y: 0 };
    addedLettersLog = new Map<string, string>();
    orderedAddedLetterLog = new Map<string, string>();
    playerHand: string[];
    boardState: string[][];
    mappedBoardState = new Map<string, string>();
    key: string;
    canPlay: boolean;
    letterAdderMode: string = '';
    letterNotAccepted: Subject<boolean> = new Subject()
    constructor(private letterHolderService: LetterHolderService,
        private gridService: GridService,
        private chatService: ChatService,
        private previewPlayerActionService: PreviewPlayersActionService) {

    }

    getLetterNotAcceptedObservable(): Subject<boolean> {
        return this.letterNotAccepted;
    }

    getDroppedSpot(pixelX: number, pixelY: number) {
        return this.findCoords(pixelX, pixelY)
    }

    onLeftClick(coords: Vec2) {
        if (this.canClick(coords)) {
            this.gridService.deleteAndRedraw();
            if (this.previewPlayerActionService.getPreviewFirstTileCoop() !== undefined) {
                this.gridService.showActivePlayerFirstTile(this.previewPlayerActionService.getPreviewFirstTileCoop()!)
            }
            if (this.prevActiveSquare.x === this.activeSquare.x && this.prevActiveSquare.y === this.activeSquare.y)
                this.arrowDirection = !this.arrowDirection;
            else this.arrowDirection = true;
            this.addArrowSquare();
            this.prevActiveSquare = this.activeSquare;
        }
    }

    onDropLetterSpot(coords: Vec2) {
        if (this.canDrop(coords)) {
            this.gridService.deleteAndRedraw();
            this.prevActiveSquare = this.activeSquare;
            return true
        } else return false
    }
    /*
    isFormerTileUsed(row: string, column: number) {
        if (this.arrowDirection) {
            const foundLetter = this.mappedBoardState.get(row + (column - 1));
            const isDirectionLeftToRight = this.prevActiveSquare.y !== column && this.prevActiveSquare.x === row;
            return Boolean(foundLetter) && isDirectionLeftToRight;
        }
        else {
            const foundLetter = this.mappedBoardState.get((String.fromCharCode(row.charCodeAt(0) - 1)) + column);
            const isDirectionTopToBottom = this.prevActiveSquare.y === column && this.prevActiveSquare.x !== row;
            return Boolean(foundLetter) && isDirectionTopToBottom;
        }
    }
*/

    findDirectionOfDrop(row: string, column: number) {
        if (this.prevActiveSquare.y === column && this.prevActiveSquare.x !== row) {
            this.arrowDirection = false;
        } else if (this.prevActiveSquare.y !== column && this.prevActiveSquare.x === row) {
            this.arrowDirection = true;
        }
    }

    setActiveSquare(xIndex: string, yIndex: number): boolean {
        this.activeSquare = { x: xIndex, y: yIndex }
        return true;
    }


    canDrop(coords: Vec2): boolean {
        const foundCoords = this.findCoords(coords.x, coords.y);
        this.findDirectionOfDrop(foundCoords.row, foundCoords.column)
        return this.canPlay && foundCoords.valid && this.setActiveSquare(foundCoords.row, foundCoords.column) && !this.isPositionTakenDragAndDrop();
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
                if (this.letterAdderMode === "keyPress" || this.letterAdderMode === "") {
                    this.addLetters(key);
                }
            }
        }
    }

    addLetters(key: string) {
        this.key = this.isLetterBlank(key) ? this.isLetterBlank(key) : this.simplifyLetter(key);
        if (this.inPlayerHand() && this.isInBounds()) {
            if (!this.isPositionTaken()) {
                this.addToHand(false);
                /**active square change rapidement le temps que je l utilise dans preview , c est d/ja devenu une autre valeur a cause de this.activeChangePostion
                 * c est pour cela que je fais une deepcopy de l object.Cela est seulement affect/ dans prevuiew
                 */
                const deepCopyActiveSquare = JSON.parse(JSON.stringify(this.activeSquare));
                this.previewPlayerActionService.addPreviewTile(deepCopyActiveSquare)
                this.gridService.drawLetter(this.activeSquare.y, this.activeSquare.x, this.key);
                this.gridService.deleteAndRedraw(this.addedLettersLog);
                if (this.previewPlayerActionService.getPreviewFirstTileCoop() !== undefined) {
                    this.gridService.showActivePlayerFirstTile(this.previewPlayerActionService.getPreviewFirstTileCoop()!)
                }
                this.changeActivePosition(1);
                this.letterAdderMode = 'keyPress';
            }
            while (this.isPositionTaken()) {
                this.changeActivePosition(1);
            }
            this.addArrowSquare();
        }
    }
    /**crrer double poujr quand on deplace une piuece dans le board */
    moveLetterInBoard(key: string) {

        this.key = this.isLetterBlank(key) ? this.isLetterBlank(key) : this.simplifyLetter(key);
        if (this.isInBounds()) {

            if (!this.isPositionTaken()) {

                this.updateDragLetterLog()
                this.previewPlayerActionService.movePreviewTile({ x: this.pervForDrag.x, y: this.pervForDrag.y }, this.activeSquare)
                this.gridService.drawLetter(this.activeSquare.y, this.activeSquare.x, this.key);
                this.gridService.deleteAndRedraw(this.addedLettersLog);
                this.letterAdderMode = 'dragAndDrop';
            }
        }
    }

    addLettersOnDrop(key: string) {
        this.key = this.isLetterBlank(key) ? this.isLetterBlank(key) : this.simplifyLetter(key);
        if (this.inPlayerHand() && this.isInBounds()) {
            if (!this.isPositionTaken()) {
                this.addToHand(false);
                /**On va mettre cela en commentaire */
                /*
                if (this.addedLettersLog.size === 0) {
                    this.previewPlayerActionService.sharePlayerFirstTile(this.activeSquare);
                }*/
                this.previewPlayerActionService.addPreviewTile(this.activeSquare)
                this.gridService.drawLetter(this.activeSquare.y, this.activeSquare.x, this.key);
                this.gridService.deleteAndRedraw(this.addedLettersLog);
                if (this.previewPlayerActionService.getPreviewFirstTileCoop() !== undefined) {
                    this.gridService.showActivePlayerFirstTile(this.previewPlayerActionService.getPreviewFirstTileCoop()!)
                }
                this.letterAdderMode = 'dragAndDrop';
            }
        }
    }



    changeActivePosition(direction: number) {
        if (this.arrowDirection) {
            this.activeSquare.y += direction;
        } else {
            this.activeSquare.x = String.fromCharCode(this.activeSquare.x.charCodeAt(0) + direction);
        }
    }

    removeDrawingBeforeDragWithinCanvas() {
        this.addedLettersLog.delete(this.pervForDrag.x + this.pervForDrag.y);
        this.gridService.deleteAndRedraw(this.addedLettersLog);
        if (this.previewPlayerActionService.getPreviewFirstTileCoop() !== undefined) {
            this.gridService.showActivePlayerFirstTile(this.previewPlayerActionService.getPreviewFirstTileCoop()!)
        }
        this.previewPlayerActionService.removePreviewTile({ x: this.pervForDrag.x, y: this.pervForDrag.y });
    }

    removeDrawingBeforeDragOutsideCanvasOrNotValidSpot() {
        const remainingLettersDrag: string[] = this.playerHand;
        const lastDraggedItem = this.addedLettersLog.get(this.pervForDrag.x + this.pervForDrag.y);
        if (lastDraggedItem!.length === 1) this.playerHand.push(lastDraggedItem!);
        else this.playerHand.push(lastDraggedItem!.slice(0, GRID_CONSTANTS.lastLetter));
        this.playerHand = remainingLettersDrag;
        this.letterHolderService.drawTypedLetters(this.playerHand);
        this.addedLettersLog.delete(this.pervForDrag.x + this.pervForDrag.y);
        if (this.addedLettersLog.size === 1) this.setAdderMode('')
        this.gridService.deleteAndRedraw(this.addedLettersLog);
        if (this.previewPlayerActionService.getPreviewFirstTileCoop() !== undefined) {
            this.gridService.showActivePlayerFirstTile(this.previewPlayerActionService.getPreviewFirstTileCoop()!)
        }
        this.previewPlayerActionService.removePreviewTile({ x: this.pervForDrag.x, y: this.pervForDrag.y });

    }
    removeLetters() {
        const decrement = -1;
        if (this.addedLettersLog.size === 1) {
            this.letterAdderMode = "";
        }
        if (!this.addedLettersLog.size) return;
        if (!this.isPositionTaken()) {
            this.addToHand(true);
            this.gridService.deleteAndRedraw(this.addedLettersLog);
            if (this.previewPlayerActionService.getPreviewFirstTileCoop() !== undefined) {
                this.gridService.showActivePlayerFirstTile(this.previewPlayerActionService.getPreviewFirstTileCoop()!)
            }
            this.changeActivePosition(decrement);
        }
        while (this.isPositionTaken()) {
            this.changeActivePosition(decrement);
        }
        if (this.letterAdderMode == "keyPress") {
            if (this.addedLettersLog.size) {
                this.addArrowSquare();
            } else {
                this.resetLetters();
            }
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

    updateDragLetterLog() {
        if (!this.key) return;
        let key = this.key;
        this.addedLettersLog.set(this.activeSquare.x + this.activeSquare.y, key);
        if (this.key.length > 1) key = this.key.slice(0, GRID_CONSTANTS.lastLetter);
    }

    addToHand(addOrDel: boolean) {
        if (!this.key) return;
        let key = this.key;
        const remainingLetters: string[] = this.playerHand;
        const lastAddedLetter = Array.from(this.addedLettersLog)[this.addedLettersLog.size - 1];
        if (addOrDel) {
            this.addedLettersLog.delete(lastAddedLetter[0]);
            this.previewPlayerActionService.removePreviewTile({ x: lastAddedLetter[0][0], y: Number(lastAddedLetter[0].substring(1)) });
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

    isPositionTakenDragAndDrop(): boolean {
        this.mapBoardState();
        const foundLetter = this.mappedBoardState.get(this.activeSquare.x + this.activeSquare.y);
        const foundLetterPutThisTurn = this.addedLettersLog.get(this.activeSquare.x + this.activeSquare.y);
        return Boolean(foundLetter) || Boolean(foundLetterPutThisTurn);
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
            const placedLetters = this.formatAddedLetters()
            if (placedLetters === "wrongMove") {
                return
            }
            if (!this.verifyLettersAreLinked()) {
                window.alert(window.alert("les lettres placées doivent être relier les unes aux autres"))
                this.getLetterNotAcceptedObservable().next(true);
                this.removeAll();
                return;
            }
            this.chatService.sendCommand(placedLetters, 'Place');
            this.removeAll();
        }
    }
    verifyLettersAreLinked() {
        let LettersOnOneDirection = new Map<string, string>();
        const arrayOfOrderedAddedLog: string[] = Array.from(this.orderedAddedLetterLog.keys());
        const firstValuePosition: string = arrayOfOrderedAddedLog[0];

        const lastValuePosition: string = arrayOfOrderedAddedLog[arrayOfOrderedAddedLog.length - 1];
        this.orderedAddedLetterLog.forEach((value, key) =>
            LettersOnOneDirection.set(key, value)
        );
        this.mappedBoardState.forEach((value, key) => {
            if (this.arrowDirection) {
                if (key[0] === firstValuePosition[0]) {
                    LettersOnOneDirection.set(key, value)
                }
            } else {
                if (key[1] === firstValuePosition[1]) {
                    LettersOnOneDirection.set(key, value)
                }

            }
        })
        if (!this.arrowDirection) {
            LettersOnOneDirection = new Map<string, string>([...LettersOnOneDirection.entries()].sort());
            const LettersOnOneDirectionArray = Array.from(LettersOnOneDirection.keys())
            let positionLetter = LettersOnOneDirectionArray[0][0].charCodeAt(0)
            for (const position of LettersOnOneDirectionArray) {

                if (position[0].charCodeAt(0) === positionLetter) {
                    if (position === lastValuePosition) {
                        return true
                    }
                    positionLetter += 1
                } else {
                    return false
                }
            }
        } else {
            LettersOnOneDirection = new Map([...LettersOnOneDirection.entries()].sort(
                (leftLetter, rightLetter) => {
                    return leftLetter[0].substring(1, leftLetter[0].length).
                        localeCompare(rightLetter[0].substring(1, rightLetter[0].length), undefined, { numeric: true })
                }));
            const LettersOnOneDirectionArray = Array.from(LettersOnOneDirection.keys())
            let positionLetter = LettersOnOneDirectionArray[0].substring(1);

            for (const position of LettersOnOneDirectionArray) {
                if (position.substring(1) === positionLetter) {
                    if (position === lastValuePosition) {
                        return true
                    }
                    positionLetter = (Number(positionLetter) + 1).toString();
                } else {
                    return false
                }

            }

        }
        return true


    }

    orderAddedLetterLog() {
        if (this.formatDirection() === 'v') {
            this.orderedAddedLetterLog = new Map<string, string>([...this.addedLettersLog.entries()].sort());
        } else {
            this.orderedAddedLetterLog = new Map([...this.addedLettersLog.entries()].sort(
                (leftLetter, rightLetter) => { return leftLetter[0].substring(1, leftLetter[0].length).localeCompare(rightLetter[0].substring(1, rightLetter[0].length), undefined, { numeric: true }) }));

        }
    }

    isHorizontal(keys: string[]): boolean {
        console.log(keys)
        const expectedValue = keys[0][0];
        for (const element of keys) {
            if (element[0] === expectedValue) {
                continue
            }
            else {
                return false;
            }
        }

        return true;
    }

    isVertical(keys: string[]): boolean {
        const expectedValue = keys[0].substring(1)
        for (const element of keys) {

            if (element.substring(1) === expectedValue) {
                continue
            }
            else {
                return false;
            }
        }
        return true;
    }

    formatAddedLetters(): string {
        this.orderAddedLetterLog();
        const keys = Array.from(this.orderedAddedLetterLog.keys());
        if (this.arrowDirection) {
            if (!this.isHorizontal(keys)) {
                window.alert("le mot place n'est pas sur la même direction")
                this.getLetterNotAcceptedObservable().next(true)
                this.removeAll()
                return "wrongMove"
                /**ajouter enelveer les lettres du fields dans component*/

            };
        }
        else {
            if (!this.isVertical(keys)) {
                window.alert("le mot place n'est pas sur la même direction")
                this.getLetterNotAcceptedObservable().next(true)
                this.removeAll()
                return "wrongMove"
                /**ajouter enelveer les lettres du fields dans component*/
            }
        }
        /**no space between letters notificiation else notification and remove all letters */
        keys.forEach((key) => {
            const value = this.orderedAddedLetterLog.get(key);
            if (value && value?.length > 1) this.orderedAddedLetterLog.set(key, value?.substring(value.length - 1).toUpperCase() as string);
        });

        const letters = Array.from(this.orderedAddedLetterLog.values()).join('');
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

    setAdderMode(mode: string) {
        this.letterAdderMode = mode;
    }
}
