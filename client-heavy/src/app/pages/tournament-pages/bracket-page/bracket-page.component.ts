import { Component, OnDestroy } from "@angular/core";
import { Router } from '@angular/router';
import { MAX_SECOND_VALUE, Timer } from "@app/classes/timer";
import { TIMER_VALUES } from "@app/constants/timer-constants";
import { AvatarInRoomsService } from "@app/services/avatar-in-rooms.service";
import { ChatService } from "@app/services/chat-service/chat.service";
import { GameStateService } from "@app/services/game-state-service/game-state.service";
import { GameData, GameStatus, TournamentService } from "@app/services/tournament-service/tournament.service";
import { WaitingRoomManagerService } from "@app/services/waiting-room-manager-service/waiting-room-manager.service";
import { Subscription } from "rxjs";
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
    s1: boolean;
    s2: boolean;
    f1: boolean;
    f2: boolean;

    users: string[] = []
    avatars: Map<string, string> = new Map<string, string>();

    subscriptionAvatar: Subscription
    constructor(private tournamentService: TournamentService,
        private waitingRoomManagerService: WaitingRoomManagerService,
        private gameStateService: GameStateService,
        private router: Router,
        private avatarInRoomService: AvatarInRoomsService,
        private chatService: ChatService) {
        /**debut pour avatar */
        this.avatarInRoomService.setUpSocket()
        this.subscriptionAvatar = this.avatarInRoomService.getUsersInRoomAvatarObservable().subscribe(() => {

        })
        /**fin pour avatar */
        this.initTimer();
        this.waitingRoomManagerService.getStartGameObservable().subscribe(this.goToGame.bind(this));
        this.tournamentService.getGameDataObservable().subscribe((data: { games: GameData[], timeData: { time: number, phase: number } }) => {
            this.games = data.games;
            this.setupGames();
            this.phase = data.timeData.phase;
            this.resetTimer({ minute: Math.floor(data.timeData.time / 60), second: (data.timeData.time % 60) });
        });
        this.tournamentService.getGameData();
    }

    setUpAvatarSemi(username: string) {
        console.log(username);
        if (this.avatarInRoomService.getAvatarUserMap(username)) {
            return this.avatarInRoomService.getAvatarUserMap(username);
        } else {
            return "virtual.png"
        }

    }

    setupGames() {
        this.s1 = false;
        this.s2 = false;
        this.f1 = false;
        this.f2 = false;
        for (let game of this.games) {
            switch (game.type) {
                case 'Semi1':
                    this.s1 = true;
                    this.semi1 = game;
                    this.users = this.users.concat(this.semi1.players);
                    if (this.semi1.players.length === 1) this.semi1.players.push('');
                    break;
                case 'Semi2':
                    this.s2 = true;
                    this.semi2 = game;
                    this.users = this.users.concat(this.semi2.players)
                    if (this.semi2.players.length === 1) this.semi2.players.push('');
                    break;
                case 'Final1':
                    this.f1 = true;
                    this.final1 = game;
                    this.users = this.users.concat(this.final1.players);
                    if (this.final1.players.length === 1) this.final1.players.push('');
                    break;
                case 'Final2':
                    this.f2 = true;
                    this.final2 = game;
                    this.users = this.users.concat(this.final2.players);
                    if (this.final2.players.length === 1) this.final2.players.push('');
                    break;
            }
        }
        console.log(this.users)
        this.avatarInRoomService.setUsersInRoom(this.users)
        this.avatarInRoomService.askAllUsersAvatar()
        if (!this.s1) this.semi1 = { type: 'Semi1', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: '' };
        if (!this.s2) this.semi2 = { type: 'Semi2', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: '' };
        if (!this.f1) this.final1 = { type: 'Final1', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: '' };
        if (!this.f2) this.final2 = { type: 'Final2', status: GameStatus.PENDING, winnerIndex: 0, players: ['', ''], roomCode: '' };
    }

    ngOnDestroy() {
        clearTimeout(this.timer);
        this.subscriptionAvatar.unsubscribe()
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

    goToGame(info: { isCoop: boolean, roomCode?: string }) {
        if (info.roomCode) this.chatService.setChatInGameRoom(info.roomCode);
        this.gameStateService.setCoop(info.isCoop);
        this.gameStateService.setObserver(-1);
        this.gameStateService.setTournamentGame(true);
        this.router.navigate(['/game']).then(() => {
            this.gameStateService.requestGameState();
        });
    }

    observeInProgressGame(game: GameData) {
        if (game.status !== GameStatus.IN_PROGRESS) return;
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

    leaveTournamentLogic() {
        this.tournamentService.leaveTournament();
    }

    leaveTournamentBtn() {
        this.tournamentService.leaveTournament();
        this.router.navigate(['/home']);
    }

    resultsBtn() {
        this.tournamentService.leaveTournament();
        const winners = [];
        const index1 = this.final1.winnerIndex < 0 ? 0 : this.final1.winnerIndex;
        winners.push(this.final1.players[index1]);
        winners.push(this.final1.players[(index1 + 1) % 2]);
        const index2 = this.final2.winnerIndex < 0 ? 0 : this.final2.winnerIndex;
        winners.push(this.final2.players[index2]);
        winners.push(this.final2.players[(index2 + 1) % 2]);
        this.tournamentService.setTournamentWinners(winners);
        this.router.navigate(['/tournament-result']);
    }
}