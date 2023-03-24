import { OnDestroy } from "@angular/core";
import { Component } from "@angular/core";
import { MAX_SECOND_VALUE, Timer } from "@app/classes/timer";
import { Router } from '@angular/router';
import { TIMER_VALUES } from "@app/constants/timer-constants";
import { GameStateService } from "@app/services/game-state-service/game-state.service";
import { GameData, GameStatus, TournamentService } from "@app/services/tournament-service/tournament.service";
import { WaitingRoomManagerService } from "@app/services/waiting-room-manager-service/waiting-room-manager.service";

@Component({
    selector: 'app-bracket-page',
    templateUrl: './bracket-page.component.html',
    styleUrls: ['./bracket-page.component.scss'],
})
export class BracketPageComponent implements OnDestroy{
    timer: any;
    currentTime: Timer = { minute: 0, second: 0 };
    betweenRounds : boolean = true;
    private stopTimer: boolean = false;

    semi1 : GameData;
    semi2 : GameData;
    final1 : GameData;
    final2 : GameData;
    private games : GameData[]= [];

    constructor(private tournamentService: TournamentService, private waitingRoomManagerService : WaitingRoomManagerService, private gameStateService : GameStateService, private router : Router){
        this.waitingRoomManagerService.getStartGameObservable().subscribe(this.goToGame.bind(this))
        this.games = this.tournamentService.getGameData();
        this.setupGames();
        this.resetTimer({minute: 0, second: 20});
        this.initTimer();
    }

    setupGames() {
        let s1 = false;
        let s2 = false;
        let f1 = false;
        let f2 = false;
        for(let game of this.games){
            switch(game.type){
                case 'Semi1':
                    s1 = true;
                    this.semi1 = game;
                    break;
                case 'Semi2':
                    s2 = true;
                    this.semi2 = game;
                    break;
                case 'Final1':
                    f1 = true;
                    this.final1 = game;
                    break;
                case 'Final2':
                    f2 = true;
                    this.final2 = game;
                    break;
            }
        }
        if(!s1) this.semi1 = {type: 'Semi1', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: ''};
        if(!s2) this.semi2 = {type: 'Semi2', status: GameStatus.PENDING, winnerIndex: 0,  players: ['', ''], roomCode: ''};
        if(!f1) this.final1 = {type: 'Final1', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: ''};
        if(!f2) this.final2 = {type: 'Final2', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: ''};
    }

    ngOnDestroy(){
        clearTimeout(this.timer);
    }

    resetTimer(time : Timer) {
        this.stopTimer = false;
        this.currentTime.minute = time.minute;
        this.currentTime.second = time.second;
    }

    getTimer(): Timer {
        return this.currentTime;
    }

    setTimerStopped(stopped: boolean) {
        this.stopTimer = stopped;
    }

    initTimer() {
        this.timer = setInterval(() => {
            if (this.stopTimer) return;
            if(this.currentTime.second === 0 && this.currentTime.minute === 0){
                this.stopTimer = true;
                return
            }
            this.currentTime.second--;
            if (this.currentTime.second < 0 && this.currentTime.minute > 0) {
                this.currentTime.second = MAX_SECOND_VALUE;
                this.currentTime.minute--;
            }
        }, TIMER_VALUES.timeJump);
    }

    goToGame(){
        this.gameStateService.setObserver(-1);
        this.router.navigate(['/game']).then(() => {
            this.gameStateService.requestGameState();
        });
    }
}