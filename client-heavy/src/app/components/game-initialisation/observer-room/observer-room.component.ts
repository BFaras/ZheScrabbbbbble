import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '@app/services/game-state-service/game-state.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-observer-room',
    templateUrl: './observer-room.component.html',
    styleUrls: ['./observer-room.component.scss'],
})
export class ObserverRoomComponent {
    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router, private gameStateService: GameStateService) {
        this.waitingRoomManagerService.getStartGameObservable().subscribe(this.goToGame.bind(this));
        this.waitingRoomManagerService.isGameStartedResponse().subscribe(this.gameStartVerif.bind(this));
        this.waitingRoomManagerService.isGameStarted();
    }

    cancelObservation() {
        this.waitingRoomManagerService.leaveRoom();
        this.router.navigate(['/join-game']);
    }

    leaveRoomLogic(): void {
        this.waitingRoomManagerService.leaveRoom();
    }

    goToGame(isCoop: boolean) {
        this.gameStateService.setCoop(isCoop);
        this.gameStateService.setObserver(0);
        this.gameStateService.setTournamentGame(false);
        this.router.navigate(['/game']).then(() => {
            this.gameStateService.requestGameState();
        });
    }

    gameStartVerif(gameStartInfo : {answer : boolean, isCoop : boolean}) {
        if (gameStartInfo.answer)this.goToGame(gameStartInfo.isCoop);
    }
}