import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account-service/account.service';
import { AvatarInRoomsService } from '@app/services/avatar-in-rooms.service';
import { GameStateService } from '@app/services/game-state-service/game-state.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnDestroy {

    pendingRequests: [string, boolean][] = [];
    playersInRoom: string[];
    avatarOfPlayers: string[];
    subscriptionAvatar: Subscription;
    constructor(private waitingRoomManagerService: WaitingRoomManagerService,
        private accountService: AccountService,
        private router: Router,
        private gameStateService: GameStateService,
        private avatarInRoomService: AvatarInRoomsService) {
        this.playersInRoom = this.waitingRoomManagerService.getDefaultPlayersInRoom();
        this.avatarOfPlayers = this.avatarInRoomService.getAvatarOfUsers()
        this.waitingRoomManagerService.getJoinRoomRequestObservable().subscribe(this.newJoinRequest.bind(this));
        this.waitingRoomManagerService.getStartGameObservable().subscribe(this.goToGame.bind(this));
        this.waitingRoomManagerService.getRoomPlayerObservable().subscribe((playersInRoom) => {
            this.playersInRoom = playersInRoom;
            this.avatarInRoomService.setUsersInRoom(this.playersInRoom);
            this.avatarInRoomService.askAllUsersAvatar();
        });
        this.subscriptionAvatar = this.avatarInRoomService.getUsersInRoomAvatarObservable().subscribe((avatars) => {
            this.avatarOfPlayers = avatars;
        })
    }
    ngOnDestroy(): void {
        this.subscriptionAvatar.unsubscribe()
    }
    launchGame(): void {
        this.refuseEveryone(true);
        this.waitingRoomManagerService.startGame();
    }

    goToGame() {
        this.gameStateService.setObserver(-1);
        this.gameStateService.setTournamentGame(false);
        this.router.navigate(['/game']).then(() => {
            this.gameStateService.requestGameState();
        });
    }

    leaveRoom(): void {
        this.leaveRoomLogic();
        this.router.navigate(['/home']);
    }

    leaveRoomLogic(): void {
        this.refuseEveryone(true);
        this.waitingRoomManagerService.leaveRoom();
    }

    isHostPlayer(): boolean {
        return this.playersInRoom[0] === this.accountService.getUsername();
    }

    newJoinRequest(data: [string, boolean]) {
        this.pendingRequests.push(data);
    }

    respondNextRequest(response: boolean) {
        const data = this.pendingRequests.shift();
        if (!data) return;
        this.waitingRoomManagerService.respondJoinRequest(response, data[0]);
        if (response && this.playersInRoom.length >= 3) {
            this.refuseEveryone(false);
        }
    }

    private refuseEveryone(refuseObservers: boolean) {
        const newPendingRequests = [];
        for (let data of this.pendingRequests) {
            if (!refuseObservers && data[1]) {
                newPendingRequests.push(data);
                continue;
            }
            this.waitingRoomManagerService.respondJoinRequest(false, data[0]);
        }
        this.pendingRequests = newPendingRequests;
    }
}
