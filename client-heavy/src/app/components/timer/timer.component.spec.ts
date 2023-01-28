/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameState } from '@app/services/game-state-service/game-state.service';
import { TimerService } from '@app/services/timer-service/timer.service';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let gameState: GameState;
    let service: TimerService;
    let timerService: jasmine.SpyObj<TimerService>;

    beforeEach(async () => {
        const getTimerSpy = jasmine.createSpyObj('TimerService', ['getTimer', 'resetTimer', 'setTimerStopped']);
        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [TimerService, { provide: TimerService, useValue: getTimerSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        timerService = TestBed.inject(TimerService) as jasmine.SpyObj<TimerService>;
        timerService.getTimer.and.returnValue({
            minute: 1,
            second: 0,
        });
        fixture = TestBed.createComponent(TimerComponent);
        service = TestBed.inject(TimerService);
        component = fixture.componentInstance;
        fixture.detectChanges();
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

    it('getTimer should return the value of timer when called', () => {
        expect(component.getTimer()).toEqual({ minute: 1, second: 0 });
    });

    it('should call resetTimer when updateTime is called but game is not over', () => {
        component['updateTime'](gameState);
        expect(timerService.resetTimer).toHaveBeenCalled();
    });

    it('should call stopTimer when updateTime is called and game is over', () => {
        gameState.gameOver = true;
        component['updateTime'](gameState);
        expect(service.setTimerStopped).toHaveBeenCalled();
    });
});
