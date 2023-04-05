import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarInRoomsService } from '@app/services/avatar-in-rooms.service';
import { GameStateService } from '@app/services/game-state-service/game-state.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-observer-room',
    templateUrl: './observer-room.component.html',
    styleUrls: ['./observer-room.component.scss'],
})
export class ObserverRoomComponent {
    playersInRoom: string[]
    subscriptionAvatar: Subscription;
    subscriptionGetRoomPlayer: Subscription;
    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router, private gameStateService: GameStateService,
        private avatarInRoomService: AvatarInRoomsService) {
        this.avatarInRoomService.setUpSocket()
        this.subscriptionAvatar = this.avatarInRoomService.getUsersInRoomAvatarObservable().subscribe(() => {
        })
        this.subscriptionGetRoomPlayer = this.waitingRoomManagerService.getRoomPlayerObservable().subscribe((playersInRoom) => {
            this.playersInRoom = playersInRoom;
            this.avatarInRoomService.setUsersInRoom(this.playersInRoom);
            this.avatarInRoomService.askAllUsersAvatar();
        });
        this.playersInRoom = this.waitingRoomManagerService.getDefaultPlayersInRoom();
        this.avatarInRoomService.setUsersInRoom(this.playersInRoom);
        this.avatarInRoomService.askAllUsersAvatar();
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

    gameStartVerif(gameStartInfo: { answer: boolean, isCoop: boolean }) {
        if (gameStartInfo.answer) this.goToGame(gameStartInfo.isCoop);
    }
}