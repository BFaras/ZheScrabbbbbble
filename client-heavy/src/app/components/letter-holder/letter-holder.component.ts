import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnDestroy, Output, ViewChild } from '@angular/core';
import { HOLDER_MEASUREMENTS, isManipulated, isSelected } from '@app/constants/letters-constants';
import { MouseButton } from '@app/constants/mouse-buttons';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GameState, GameStateService } from '@app/services/game-state-service/game-state.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { ManipulationRackService } from '@app/services/manipulation-rack-service/manipulation-rack.service';
import { MouseService } from '@app/services/mouse-service/mouse.service';
import { Subscription } from 'rxjs';

const LIMIT_LETTERS_IN_RESERVE = 7;
const LIMIT_MULTIPLE_OCCURENCES = 2;
const OFFSET_POSITION = 1;

@Component({
    selector: 'app-letter-holder',
    templateUrl: './letter-holder.component.html',
    styleUrls: ['./letter-holder.component.scss'],
})
export class LetterHolderComponent implements AfterViewInit, OnDestroy {
    @Output() receiver = new EventEmitter();
    @ViewChild('letterHolder', { static: false }) private letterHolder!: ElementRef<HTMLCanvasElement>;
    switch: boolean = false;
    isDisabled: boolean = false;
    notEnoughLettersLeft: boolean = false;
    mouseIsIn: boolean = false;
    makingSelection: boolean = false;
    playerHand: string[] = [''];
    oldKeyPressed: string = '';
    counter: number = 0;
    initialPosition: number = 0;
    subscription: Subscription;
    viewLoaded = false;

    private holderSize = { x: HOLDER_MEASUREMENTS.holderWidth, y: HOLDER_MEASUREMENTS.holderHeight };
    private initialGameState: GameState;

    constructor(
        private readonly accountService: AccountService,
        private readonly letterHolderService: LetterHolderService,
        private readonly gameStateService: GameStateService,
        private chatService: ChatService,
        private mouseService: MouseService,
        private letterAdderService: LetterAdderService,
        private manipulationRack: ManipulationRackService,
    ) {
        this.subscription = this.gameStateService.getGameStateObservable().subscribe((gameState) => {
            if (this.viewLoaded) {
                this.updateHolder(gameState)
            } else {
                this.initialGameState = gameState;
            }
        });
    }

    @HostListener('click', ['$event'])
    clickInside(e: MouseEvent) {
        if (e.button === MouseButton.Right) {
            if (!this.mouseIsIn) return;
            this.isReceiver();
            this.manipulationRack.cancelManipulation();
            this.mouseService.selectRack({ x: e.offsetX, y: e.offsetY });
            this.makingSelection = Object.values(isSelected).some((selection) => selection === true);
        } else if (e.button === MouseButton.Left) {
            if (!this.mouseIsIn) return;
            e.stopPropagation();
            this.isReceiver();
            this.makingSelection = false;
            this.manipulationRack.cancelAll(isSelected);
            this.initialPosition = this.mouseService.manipulateRackOnClick({ x: e.offsetX, y: e.offsetY }) as number;
            this.counter = 0;
        }
        return;
    }

    @HostListener('window:keypress', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if (!this.mouseIsIn) return;

        let letter = e.key.toLowerCase();
        letter = letter === '*' ? 'blank' : letter;
        this.makingSelection = false;
        if (this.playerHand.includes(letter)) {
            const occurence = this.checkOccurence(letter);
            this.initialPosition = this.playerHand.indexOf(letter) + OFFSET_POSITION;

            if (this.oldKeyPressed === letter) {
                this.counter += 1;
                this.manipulationRack.manipulateRackOnKey(this.nextIndex(this.playerHand, letter, this.counter) + OFFSET_POSITION);
                this.counter = this.counter >= occurence ? 0 : this.counter;
            } else {
                this.manipulationRack.manipulateRackOnKey(this.playerHand.indexOf(letter) + OFFSET_POSITION);
                this.counter = 0;
            }
        } else {
            this.cancelSelection();
        }

        return;
    }

    @HostListener('window:keydown', ['$event'])
    onArrowDown(e: KeyboardEvent) {
        if (!this.mouseIsIn || this.makingSelection) return;
        if (e.key === 'ArrowRight') {
            this.manipulationRack.moveLetter('right', this.initialPosition, this.playerHand);
            this.initialPosition++;
            this.initialPosition = this.initialPosition >= HOLDER_MEASUREMENTS.maxPositionHolder + OFFSET_POSITION ? 1 : this.initialPosition;
        } else if (e.key === 'ArrowLeft') {
            this.manipulationRack.moveLetter('left', this.initialPosition, this.playerHand);
            this.initialPosition--;
            this.initialPosition = this.initialPosition <= 0 ? HOLDER_MEASUREMENTS.maxPositionHolder : this.initialPosition;
        }
        return;
    }

    @HostListener('window:wheel', ['$event'])
    onWheel(e: WheelEvent) {
        e.stopPropagation();
        if (!this.mouseIsIn || this.makingSelection) return;
        if (e.deltaY > 0) {
            this.manipulationRack.moveLetter('right', this.initialPosition, this.playerHand);
            this.initialPosition++;
            this.initialPosition = this.initialPosition >= HOLDER_MEASUREMENTS.maxPositionHolder + OFFSET_POSITION ? 1 : this.initialPosition;
        } else if (e.deltaY < 0) {
            this.manipulationRack.moveLetter('left', this.initialPosition, this.playerHand);
            this.initialPosition--;
            this.initialPosition = this.initialPosition <= 0 ? HOLDER_MEASUREMENTS.maxPositionHolder : this.initialPosition;
        }
        return;
    }

    @HostListener('document:click') clickOut() {
        if (!this.mouseIsIn) return;
        this.cancelSelection();
        this.mouseIsIn = false;
    }

    nextIndex(hand: string[], letter: string, nextLetter: number): number {
        let position = -1;
        while (nextLetter-- && position++ < hand.length) {
            position = hand.indexOf(letter, position);
            if (position < 0) break;
        }
        return position;
    }

    ngAfterViewInit() {
        this.viewLoaded = true;
        this.letterHolderService.holderContext = this.letterHolder.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        console.log("View Init Done");
        this.updateHolder(this.initialGameState);
    }

    updateHolder(gameState: GameState) {
        let playerIndex;
        for (playerIndex = 0; playerIndex < gameState.players.length; playerIndex++) {
            if (gameState.players[playerIndex].username === this.accountService.getUsername()) break;
        }
        this.letterHolderService.setHolderState(this.formatHandState([...gameState.players[playerIndex].hand]));
        this.letterHolderService.addLetters();
        this.isDisabled = !(playerIndex === gameState.playerTurnIndex);
        this.playerHand = this.letterHolderService.holderState;
        this.letterAdderService.setPlayerHand(this.playerHand);
        this.letterAdderService.setCanPlay(this.isDisabled);
        if (gameState.reserveLength < LIMIT_LETTERS_IN_RESERVE) this.notEnoughLettersLeft = true;
        this.cancelSelection();
    }

    formatHandState(hand: string[]): string[] {
        const letters: string[] = [];
        this.letterHolderService.letterLog.forEach((letter: string, key: number) => {
            const lowerLetter = letter.toLowerCase();
            if (hand.includes(lowerLetter)) {
                delete hand[hand.indexOf(lowerLetter)];
                letters[key - 1] = lowerLetter;
            }
        });
        for (const letter of hand) {
            for (let i = 0; i < LIMIT_LETTERS_IN_RESERVE; i++) {
                if (!letters[i]) {
                    letters[i] = letter;
                    break;
                }
            }
        }
        while (letters.length < LIMIT_LETTERS_IN_RESERVE) letters.push('');
        return letters;
    }

    sendWord() {
        this.letterAdderService.makeMove();
    }

    isReceiver() {
        this.switch = !this.switch;
        this.receiver.emit('letterholder' + this.switch);
        this.mouseIsIn = true;
        return false;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    skipTurn() {
        this.chatService.sendCommand('', 'Pass');
    }

    cancelSelection() {
        this.makingSelection = false;
        this.counter = 0;
        this.manipulationRack.cancelAll(isSelected);
        this.manipulationRack.cancelAll(isManipulated);
    }

    swapLetters() {
        const result = this.filterBlanckLetter(this.lettersToSwap(this.playerHand, isSelected));

        this.chatService.sendCommand(`${result.join('')}`, 'Swap');
    }

    checkOccurence(letter: string): number {
        this.oldKeyPressed = this.playerHand.reduce((a, v) => (v === letter ? a + 1 : a), 0) >= LIMIT_MULTIPLE_OCCURENCES ? letter : '';
        return this.playerHand.reduce((a, v) => (v === letter ? a + 1 : a), 0);
    }

    filterBlanckLetter(lettersToFilter: string[]): string[] {
        const lettersToSwap = lettersToFilter;
        lettersToSwap.forEach((element, index) => {
            if (element === 'blank') {
                lettersToSwap[index] = '*';
            }
        });
        return lettersToSwap;
    }

    lettersToSwap(handLetters: string[], selectedPosition: { [key: string]: boolean }): string[] {
        const lettersToSwap: string[] = [];

        this.filterPosition(selectedPosition).forEach((position) => {
            lettersToSwap.push(handLetters[position - OFFSET_POSITION]);
        });

        return lettersToSwap;
    }

    filterPosition(selectedPosition: { [key: string]: boolean }): number[] {
        return Object.keys(selectedPosition)
            .filter((position) => selectedPosition[position] === true)
            .map((x) => {
                return Number(x);
            });
    }

    get height(): number {
        return this.holderSize.y;
    }

    get width(): number {
        return this.holderSize.x;
    }
}
