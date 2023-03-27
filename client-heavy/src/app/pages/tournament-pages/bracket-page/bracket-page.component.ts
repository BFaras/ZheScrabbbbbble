import { Component, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { MAX_SECOND_VALUE, Timer } from "@app/classes/timer";
import { TIMER_VALUES } from "@app/constants/timer-constants";
import { GameStateService } from "@app/services/game-state-service/game-state.service";
import { GameData, GameStatus, TournamentService } from "@app/services/tournament-service/tournament.service";
import { WaitingRoomManagerService } from "@app/services/waiting-room-manager-service/waiting-room-manager.service";
import { first } from "rxjs/operators";

@Component({
    selector: 'app-bracket-page',
    templateUrl: './bracket-page.component.html',
    styleUrls: ['./bracket-page.component.scss'],
})
export class BracketPageComponent implements OnDestroy {
    timer: any;
    currentTime: Timer = { minute: 0, second: 0 };
    phase: number;
    private stopTimer: boolean = false;

    semi1: GameData;
    semi2: GameData;
    final1: GameData;
    final2: GameData;
    private games: GameData[] = [];

    constructor(private tournamentService: TournamentService, private waitingRoomManagerService: WaitingRoomManagerService, private gameStateService: GameStateService, private router: Router) {
        this.initTimer();
        this.waitingRoomManagerService.getStartGameObservable().subscribe(this.goToGame.bind(this));
        this.tournamentService.getGameDataObservable().subscribe((data : {games: GameData[], timeData : {time: number, phase : number}}) => {
            this.games = data.games;
            this.setupGames();
            this.phase = data.timeData.phase;
            this.resetTimer({ minute: Math.floor(data.timeData.time / 60), second: (data.timeData.time % 60) });
        });
        this.tournamentService.getGameData();
    }

    setupGames() {
        let s1 = false;
        let s2 = false;
        let f1 = false;
        let f2 = false;
        for (let game of this.games) {
            switch (game.type) {
                case 'Semi1':
                    s1 = true;
                    this.semi1 = game;
                    if (this.semi1.players.length === 1) this.semi1.players.push('');
                    break;
                case 'Semi2':
                    s2 = true;
                    this.semi2 = game;
                    if (this.semi2.players.length === 1) this.semi2.players.push('');
                    break;
                case 'Final1':
                    f1 = true;
                    this.final1 = game;
                    if (this.final1.players.length === 1) this.final1.players.push('');
                    break;
                case 'Final2':
                    f2 = true;
                    this.final2 = game;
                    if (this.final2.players.length === 1) this.final2.players.push('');
                    break;
            }
        }
        if (!s1) this.semi1 = { type: 'Semi1', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: '' };
        if (!s2) this.semi2 = { type: 'Semi2', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: '' };
        if (!f1) this.final1 = { type: 'Final1', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: '' };
        if (!f2) this.final2 = { type: 'Final2', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: '' };
    }

    ngOnDestroy() {
        clearTimeout(this.timer);
    }

    resetTimer(time: Timer) {
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
            if (this.currentTime.second === 0 && this.currentTime.minute === 0) {
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

    goToGame() {
        this.gameStateService.setObserver(-1);
        this.gameStateService.setTournamentGame(true);
        this.router.navigate(['/game']).then(() => {
            this.gameStateService.requestGameState();
        });
    }

    observeInProgressGame(game : GameData){
        if(game.status !== GameStatus.IN_PROGRESS) return;
        this.waitingRoomManagerService.setObserver(true);
        this.waitingRoomManagerService.joinRoomResponse().pipe(first()).subscribe(() => {
            this.gameStateService.setObserver(0);
            this.gameStateService.setTournamentGame(true);
            this.router.navigate(['/game']).then(() => {
                this.gameStateService.requestGameState();
            });
        });
        this.waitingRoomManagerService.joinRoom(game.roomCode);
    }

    leaveTournamentLogic(){
        this.tournamentService.leaveTournament();
    }
}