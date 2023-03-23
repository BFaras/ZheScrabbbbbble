import { Injectable } from '@angular/core';
import { MAX_SECOND_VALUE, Timer } from '@app/classes/timer';
import { TIMER_VALUES } from '@app/constants/timer-constants';

const TIME: Timer = { minute: 1, second: 0 };

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    currentTimer: Timer = { minute: 0, second: 0 };
    private stopTimer: boolean = false;

    constructor() {
        this.modifyTimer();
    }

    resetTimer() {
        this.stopTimer = false;
        this.currentTimer.minute = TIME.minute;
        this.currentTimer.second = TIME.second;
    }

    getTimer(): Timer {
        return this.currentTimer;
    }

    setTimerStopped(stopped: boolean) {
        this.stopTimer = stopped;
    }

    modifyTimer() {
        setInterval(() => {
            if (this.stopTimer) return;
            if(this.currentTimer.second === 0 && this.currentTimer.minute === 0){
                this.stopTimer = true;
                return
            }
            this.currentTimer.second--;
            if (this.currentTimer.second < 0 && this.currentTimer.minute > 0) {
                this.currentTimer.second = MAX_SECOND_VALUE;
                this.currentTimer.minute--;
            }
        }, TIMER_VALUES.timeJump);
    }
}
