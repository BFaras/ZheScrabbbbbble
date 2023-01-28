/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;
    let defaultjasmineTimeOut: number;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerService);
        defaultjasmineTimeOut = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        jasmine.clock().uninstall();
        jasmine.clock().install();
        service.currentTimer = { minute: 1, second: 0 };
    });

    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultjasmineTimeOut;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getTimer should return the value of timer when called', () => {
        expect(service.getTimer()).toEqual(service.currentTimer);
    });

    it('resetTimer should call change currentTimer', () => {
        service['currentTimer'] = { minute: 1, second: 0 };
        service['timeChosen'] = { minute: 0, second: 1 };
        service.resetTimer();
        expect(service['currentTimer']).toEqual({ minute: 0, second: 1 });
    });

    it('resetTimer should reset timer value to timeChosen when called', () => {
        service.timeChosen = { minute: 1, second: 0 };
        const twoSecondsMS = 2000;
        jasmine.clock().tick(twoSecondsMS);
        service.resetTimer();
        expect(service.currentTimer).toEqual(service.timeChosen);
    });

    it('setInterval should change timer value when called', () => {
        service.modifyTimer();
        expect(service.currentTimer).toBeDefined();
    });

    it('setInterval should change minute and second values when called', () => {
        const expectedTimeValue = { minute: 0, second: 58 };
        const twoSecondsMS = 2000;
        service.modifyTimer();
        jasmine.clock().tick(twoSecondsMS);
        expect(service.currentTimer.minute).toEqual(expectedTimeValue.minute);
        expect(service.currentTimer.second).toEqual(expectedTimeValue.second);
    });

    it('should stop timer when setTimerStopped is called', () => {
        service['stopTimer'] = true;
        service.setTimerStopped(false);
        expect(service['stopTimer']).toBeFalse();
        service.setTimerStopped(true);
        expect(service['stopTimer']).toBeTrue();
    });

    it('should change the value of time chosen when calling updateTimeChosen', () => {
        service['timeChosen'] = { minute: 2, second: 30 };
        service.updateTimeChosen({ minute: 3, second: 0 });
        expect(service['timeChosen']).toEqual({ minute: 3, second: 0 });
    });
});
