/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GameState } from '@app/services/game-state-service/game-state.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { ManipulationRackService } from '@app/services/manipulation-rack-service/manipulation-rack.service';
import { MouseService } from '@app/services/mouse-service/mouse.service';
import { LetterHolderComponent } from './letter-holder.component';

describe('LetterHolderComponent', () => {
    let component: LetterHolderComponent;
    let fixture: ComponentFixture<LetterHolderComponent>;
    let chatService: ChatService;
    let mouseService: MouseService;
    let manipulationRack: ManipulationRackService;
    let letterAdder: LetterAdderService;
    let gameState: GameState;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LetterHolderComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LetterHolderComponent);
        component = fixture.componentInstance;
        component.playerHand = ['a', 'i'];
        component.oldKeyPressed = '';

        fixture.detectChanges();
        chatService = TestBed.inject(ChatService);
        mouseService = TestBed.inject(MouseService);
        manipulationRack = TestBed.inject(ManipulationRackService);
        letterAdder = TestBed.inject(LetterAdderService);
        gameState = {
            board: [[]],
            hand: ['a', 'a', 'a'],
            opponentHandLength: 7,
            isYourTurn: true,
            yourScore: 10,
            opponentScore: 10,
            reserveLength: 80,
            gameOver: false,
            boardWithInvalidWords: undefined,
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should trigger keyboard event when key pressed inside letter holder', () => {
        const spyComponentClick = spyOn(component, 'onKeyDown');
        const element = fixture.debugElement.query(By.css('canvas'));
        element.nativeElement.dispatchEvent(new KeyboardEvent('keypress', { code: 'a' }));
        fixture.detectChanges();
        expect(spyComponentClick).toHaveBeenCalled();
    });

    it('should trigger right click event when right clicking inside letter holder', () => {
        const spyComponentClick = spyOn(component, 'clickInside');
        const element = fixture.debugElement.query(By.css('canvas'));
        element.triggerEventHandler('contextmenu', new MouseEvent('contextmenu'));
        fixture.detectChanges();
        expect(spyComponentClick).toHaveBeenCalled();
    });

    it('should trigger left click event when left clicking inside letter holder', () => {
        const spyComponentClick = spyOn(component, 'clickInside');
        const element = fixture.debugElement.query(By.css('canvas'));
        element.triggerEventHandler('click', {});
        fixture.detectChanges();
        expect(spyComponentClick).toHaveBeenCalled();
    });

    it('should set the holder state when calling updateHolder', () => {
        const setHolderStateSpy = spyOn(component['letterHolderService'], 'setHolderState');
        component.updateHolder(gameState);
        expect(setHolderStateSpy).toHaveBeenCalled();
    });

    it('should call mouse service when clicking for selection inside letter holder', () => {
        component.mouseIsIn = true;
        const spyMouse = spyOn(mouseService, 'selectRack');
        const mouseEventMock = new MouseEvent('contextmenu', {
            button: 2,
        });
        component.clickInside(mouseEventMock);
        expect(spyMouse).toHaveBeenCalled();
    });

    it('should call mouse service when clicking for manipulation inside letter holder', () => {
        component.mouseIsIn = true;
        const spyMouse = spyOn(mouseService, 'manipulateRackOnClick');
        const mouseEventMock = new MouseEvent('click', {
            button: 0,
        });
        component.clickInside(mouseEventMock);
        expect(spyMouse).toHaveBeenCalled();
    });

    it('should return false to prevent default event when right click is occured', () => {
        component.mouseIsIn = true;
        const mouseEventMock = new MouseEvent('contextmenu', {
            button: 2,
        });
        const spyReceiver = component.isReceiver();
        component.clickInside(mouseEventMock);
        expect(spyReceiver).toEqual(false);
    });

    it('should call manipulateRackOnKey if key pressed is in player hand', () => {
        component.mouseIsIn = true;
        const spyMouse = spyOn(manipulationRack, 'manipulateRackOnKey');
        const keyEventMock = new KeyboardEvent('keypress', { key: 'a' });
        component.onKeyDown(keyEventMock);
        expect(spyMouse).toHaveBeenCalled();
    });

    it('should call manipulateRackOnKey nth times if key is pressed again when present multiple times in player hand', () => {
        component.playerHand = ['a', 'a', 'i'];
        component.mouseIsIn = true;
        const spyMouse = spyOn(manipulationRack, 'manipulateRackOnKey');
        const keyEventMock = new KeyboardEvent('keypress', { key: 'a' });
        component.onKeyDown(keyEventMock);
        component.onKeyDown(keyEventMock);
        expect(spyMouse).toHaveBeenCalledTimes(2);
    });

    it('should call cancelSelection if key pressed is not in player hand', () => {
        component.mouseIsIn = true;
        const spyMouse = spyOn(component, 'cancelSelection');
        const keyEventMock = new KeyboardEvent('keypress', { key: 'z' });
        component.onKeyDown(keyEventMock);
        expect(spyMouse).toHaveBeenCalled();
    });

    it('should call moveLetter if right arrow is pressed', () => {
        component.mouseIsIn = true;
        const spyArrow = spyOn(manipulationRack, 'moveLetter');
        const keyEventMock = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        component.onArrowDown(keyEventMock);
        expect(spyArrow).toHaveBeenCalledTimes(1);
    });

    it('should call moveLetter if left arrow is pressed', () => {
        component.mouseIsIn = true;
        const spyArrow = spyOn(manipulationRack, 'moveLetter');
        const keyEventMock = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        component.onArrowDown(keyEventMock);
        expect(spyArrow).toHaveBeenCalledTimes(1);
    });

    it('should increase initialPosition if right arrow is called', () => {
        component.mouseIsIn = true;
        component.initialPosition = 0;
        const keyEventMock = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        component.onArrowDown(keyEventMock);
        expect(component.initialPosition).toEqual(1);
    });

    it('should reinitialize initialPosition if right arrow is called and we are at the end of the rack', () => {
        component.mouseIsIn = true;
        component.initialPosition = 7;
        const keyEventMock = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        component.onArrowDown(keyEventMock);
        expect(component.initialPosition).toEqual(1);
    });

    it('should decrease initialPosition if left arrow is called', () => {
        component.mouseIsIn = true;
        component.initialPosition = 3;
        const keyEventMock = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        component.onArrowDown(keyEventMock);
        expect(component.initialPosition).toEqual(2);
    });

    it('should reinitialize initialPosition if left arrow is called and we are at the end of the rack', () => {
        component.mouseIsIn = true;
        component.initialPosition = 1;
        const keyEventMock = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        component.onArrowDown(keyEventMock);
        expect(component.initialPosition).toEqual(7);
    });

    it('should call moveLetter if mouse wheel is scrolled up', () => {
        component.mouseIsIn = true;
        const spyWheel = spyOn(manipulationRack, 'moveLetter');
        const wheelEventMock = new WheelEvent('wheel', { deltaY: 10 });
        component.onWheel(wheelEventMock);
        expect(spyWheel).toHaveBeenCalledTimes(1);
    });

    it('should call moveLetter if mouse wheel is scrolled down', () => {
        component.mouseIsIn = true;
        const spyWheel = spyOn(manipulationRack, 'moveLetter');
        const wheelEventMock = new WheelEvent('wheel', { deltaY: -10 });
        component.onWheel(wheelEventMock);
        expect(spyWheel).toHaveBeenCalledTimes(1);
    });

    it('should send pass command when skip turn is called', () => {
        const chatSpy = spyOn(chatService, 'sendCommand');
        component.skipTurn();
        expect(chatSpy).toHaveBeenCalledWith('', 'Pass');
    });

    it('should send swap command when swap letters is called', () => {
        const chatSpy = spyOn(chatService, 'sendCommand');
        component.swapLetters();
        expect(chatSpy).toHaveBeenCalled();
    });

    it('should call cancelAll if cancelSelection is called', () => {
        const mouseSpy = spyOn(manipulationRack, 'cancelAll');
        component.cancelSelection();
        expect(mouseSpy).toHaveBeenCalled();
    });

    it('should call cancelSelection when Cancel button is pressed', () => {
        spyOn(component, 'cancelSelection');
        const button = fixture.debugElement.query(By.css('#cancelButton'));
        button.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.cancelSelection).toHaveBeenCalled();
    });

    it('should call sendWords when Play button is pressed', () => {
        spyOn(component, 'sendWord');
        const button = fixture.debugElement.query(By.css('#playButton'));
        button.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.sendWord).toHaveBeenCalled();
    });

    it('should call makeMove of letterAdderService when sending words', () => {
        const letterAdderSpy = spyOn(letterAdder, 'makeMove');
        component.sendWord();
        expect(letterAdderSpy).toHaveBeenCalled();
    });

    it('should call swapLetters when swap button is pressed', () => {
        spyOn(component, 'swapLetters');
        const button = fixture.debugElement.query(By.css('#swapButton'));
        button.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.swapLetters).toHaveBeenCalled();
    });

    it('should call skipTurn when skip button is pressed', () => {
        spyOn(component, 'skipTurn');
        const button = fixture.debugElement.query(By.css('#skipButton'));
        button.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.skipTurn).toHaveBeenCalled();
    });

    it('should return an empty string if no selection was made', () => {
        const selectedPosition: { [key: string]: boolean } = { 1: false, 2: false };
        const result: number[] = component.filterPosition(selectedPosition);
        expect(result).toHaveSize(0);
    });

    it('should return a string of position if selection was made', () => {
        const selectedPosition: { [key: string]: boolean } = { 1: true, 2: true };
        const result: number[] = component.filterPosition(selectedPosition);
        expect(result).toEqual([1, 2]);
        expect(result).toHaveSize(2);
    });

    it('should return all letters if all are selected', () => {
        const selectedPosition: { [key: string]: boolean } = { 1: true, 2: true };
        const playerHand: string[] = ['a', 'e'];
        const result: string[] = component.lettersToSwap(playerHand, selectedPosition);
        expect(result).toEqual(['a', 'e']);
        expect(result).toHaveSize(2);
    });

    it('should return all letters corresponding to the selected position', () => {
        const selectedPosition: { [key: string]: boolean } = { 1: true, 2: false, 3: true };
        const playerHand: string[] = ['a', 'e', 'i'];
        const result: string[] = component.lettersToSwap(playerHand, selectedPosition);
        expect(result).toEqual(['a', 'i']);
        expect(result).toHaveSize(2);
    });

    it('should return an empty string since no letters have been selected', () => {
        const selectedPosition: { [key: string]: boolean } = { 1: false, 2: false };
        const playerHand: string[] = ['a', 'e'];
        const result: string[] = component.lettersToSwap(playerHand, selectedPosition);
        expect(result).toEqual([]);
        expect(result).toHaveSize(0);
    });

    it('should change blank letters to *', () => {
        const lettersToFilter: string[] = ['a', 'e', 'blank', 'i', 'blank'];
        const result = component.filterBlanckLetter(lettersToFilter);
        expect(result).toEqual(['a', 'e', '*', 'i', '*']);
    });

    it('should ckeck number of occurences and change value of oldKeyPressed if occurences greater or equal to 2', () => {
        component.playerHand = ['a', 'a', 'a', 'i', 'z'];
        const occurences = component.checkOccurence('a');
        expect(occurences).toEqual(3);
        expect(component.oldKeyPressed).toEqual('a');
    });

    it('should ckeck number of occurences and not change value of oldKeyPressed', () => {
        const occurences = component.checkOccurence('a');
        expect(occurences).toEqual(1);
        expect(component.oldKeyPressed).toEqual('');
    });
    it('should switch variable to true if rack becomes receiver', () => {
        component.switch = false;
        spyOn(component.receiver, 'emit');
        component.isReceiver();
        expect(component.receiver.emit).toHaveBeenCalledWith('letterholder' + component.switch);
        expect(component.switch).toBeTruthy();
    });
    it('should make mouseIsIn variable to true if rack becomes receiver', () => {
        component.isReceiver();
        expect(component.mouseIsIn).toBeTruthy();
    });
    it('should handle document click', () => {
        component.mouseIsIn = true;
        const spyCancel = spyOn(component, 'cancelSelection');
        document.dispatchEvent(new MouseEvent('click'));
        expect(component.mouseIsIn).toBe(false);
        expect(spyCancel).toHaveBeenCalled();
    });

    it('should keep the letter log order when calling formatHandState', () => {
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        component['letterHolderService']['letterLog'] = new Map<number, string>();
        component['letterHolderService']['letterLog'].set(1, 'G');
        component['letterHolderService']['letterLog'].set(2, 'F');
        component['letterHolderService']['letterLog'].set(3, 'E');
        component['letterHolderService']['letterLog'].set(4, 'D');
        component['letterHolderService']['letterLog'].set(5, 'C');
        component['letterHolderService']['letterLog'].set(6, 'B');
        component['letterHolderService']['letterLog'].set(7, 'A');
        expect(component.formatHandState(letters)).toEqual(['g', 'f', 'e', 'd', 'c', 'b', 'a']);
    });

    it('should fill array with empty string when calling formatHandState', () => {
        component['letterHolderService']['letterLog'] = new Map<number, string>();
        expect(component.formatHandState([])).toEqual(['', '', '', '', '', '', '']);
    });
});
