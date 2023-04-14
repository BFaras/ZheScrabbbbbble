import { Component, OnDestroy, OnInit } from '@angular/core';
import { Timer } from '@app/classes/timer';
import { GameState, GameStateService } from '@app/services/game-state-service/game-state.service';
import { TimerService } from '@app/services/timer-service/timer.service';
import { Subscription } from 'rxjs';

const DEFAULT_TIMER_TIME = 60;

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
    subscription: Subscription;

    constructor(private timerService: TimerService, private readonly gameStateService: GameStateService) {}

    ngOnInit(): void {
        this.timerService.setTimerStopped(false);
        this.timerService.resetTimer(DEFAULT_TIMER_TIME);
        this.subscription = this.gameStateService.getGameStateObservable().subscribe((gameState) => this.updateTime(gameState));
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    getTimer(): Timer {
        return this.timerService.getTimer();
    }

    updateTime(gameState: GameState) {
        if (gameState.gameOver) {
            this.timerService.setTimerStopped(true);
        } else {

            this.timerService.resetTimer(gameState.timeLeft);
        }
    }
}
