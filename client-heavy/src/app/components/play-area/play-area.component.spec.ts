/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GameState } from '@app/services/game-state-service/game-state.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let letterAdderService: LetterAdderService;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let gameState: GameState;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
        }).compileComponents();
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
        letterAdderService = TestBed.inject(LetterAdderService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update board once if boardWithInvalidWords is undefined when updating board state', () => {
        const boardStateSpy = spyOn(component['gridService'], 'setBoardState');
        component['updateBoardState'](gameState);
        expect(boardStateSpy).toHaveBeenCalledTimes(1);
    });

    it('should call delay if boardWithInvalidWords is not undefined when updating board state', () => {
        const boardStateSpy = spyOn(component, 'delay');
        gameState.boardWithInvalidWords = [['test']];
        component['updateBoardState'](gameState);
        expect(boardStateSpy).toHaveBeenCalled();
    });

    it('should trigger buttonDetect and call onPressDown from LetterAdderService on keyboard press down ', () => {
        const buttonDetectSpy = spyOn(component, 'buttonDetect').and.callThrough();
        const onPressDownSpy = spyOn(letterAdderService, 'onPressDown');
        const keyEventMock = new KeyboardEvent('keypress', { key: 'z' });
        component.buttonDetect(keyEventMock);
        expect(buttonDetectSpy).toHaveBeenCalled();
        expect(onPressDownSpy).toHaveBeenCalledWith('z');
    });

    it('should trigger mouseHitDetect and call onLeftClick from LetterAdderService on left click ', () => {
        const clickInsideSpy = spyOn(component, 'mouseHitDetect').and.callThrough();
        const onLeftClickSpy = spyOn(letterAdderService, 'onLeftClick');
        const element = fixture.debugElement.query(By.css('canvas'));
        element.triggerEventHandler('click', new MouseEvent('click'));
        fixture.detectChanges();
        expect(clickInsideSpy).toHaveBeenCalled();
        expect(onLeftClickSpy).toHaveBeenCalled();
    });

    it('onChanges should call removeAll if the keyboard receiver changes', () => {
        const removeAllSpy = spyOn(letterAdderService, 'removeAll');
        component.ngOnChanges();
        expect(removeAllSpy).toHaveBeenCalled();
    });

    it('onChanges should not call removeAll if the click was on the play area', () => {
        const removeAllSpy = spyOn(letterAdderService, 'removeAll');
        const element = fixture.debugElement.query(By.css('canvas'));
        element.triggerEventHandler('click', new MouseEvent('click'));
        fixture.detectChanges();
        expect(removeAllSpy).toHaveBeenCalledTimes(0);
    });

    it('clickInside should change the receiver value to playarea', () => {
        const setReceiverSpy = spyOn(component, 'setReceiver').and.callThrough();
        const element = fixture.debugElement.query(By.css('canvas'));
        element.triggerEventHandler('click', new MouseEvent('click'));
        fixture.detectChanges();
        expect(setReceiverSpy).toHaveBeenCalledWith('playarea');
        expect(component.receiver).toEqual('playarea');
    });

    it('should wait when calling delay', () => {
        const timeoutSpy = spyOn(window, 'setTimeout');
        component.delay(1);
        expect(timeoutSpy).toHaveBeenCalled();
    });
});
