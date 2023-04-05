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
    subscriptionJoinRoomRequest: Subscription;
    subscriptionStartGame: Subscription;
    subscriptionGetRoomPlayer: Subscription;
    constructor(private waitingRoomManagerService: WaitingRoomManagerService,
        private accountService: AccountService,
        private router: Router,
        private gameStateService: GameStateService,
        private avatarInRoomService: AvatarInRoomsService) {
        /**debut à modifier quand on recoit avatar avec usernames */
        this.avatarInRoomService.setUpSocket()
        this.subscriptionAvatar = this.avatarInRoomService.getUsersInRoomAvatarObservable().subscribe((avatars) => {
            this.avatarOfPlayers = avatars;
            console.log("in waiting-room after added player")
            console.log(this.playersInRoom);
            console.log(this.avatarOfPlayers);
        })
        /**debut à modifier quand on recoit avatar avec usernames */
        this.playersInRoom = this.waitingRoomManagerService.getDefaultPlayersInRoom();
        this.avatarInRoomService.setUsersInRoom(this.playersInRoom)
        console.log(this.playersInRoom)
        console.log(this.avatarInRoomService.getAvatarOfUsers())
        /** */
        this.avatarInRoomService.askAllUsersAvatar();
        this.avatarOfPlayers = this.avatarInRoomService.getAvatarOfUsers();
        console.log("in waiting-room when created")
        console.log(this.playersInRoom);
        console.log(this.avatarOfPlayers);
        this.subscriptionJoinRoomRequest = this.waitingRoomManagerService.getJoinRoomRequestObservable().subscribe(this.newJoinRequest.bind(this));
        this.subscriptionStartGame = this.waitingRoomManagerService.getStartGameObservable().subscribe(this.goToGame.bind(this));
        this.subscriptionGetRoomPlayer = this.waitingRoomManagerService.getRoomPlayerObservable().subscribe((playersInRoom) => {
            this.playersInRoom = playersInRoom;
            this.avatarInRoomService.setUsersInRoom(this.playersInRoom);
            this.avatarInRoomService.askAllUsersAvatar();
        });

    }

    ngOnDestroy(): void {
        this.subscriptionAvatar.unsubscribe();
        this.subscriptionGetRoomPlayer.unsubscribe()
        this.subscriptionJoinRoomRequest.unsubscribe();
        this.subscriptionStartGame.unsubscribe()
    }
    launchGame(): void {
        this.refuseEveryone(true);
        this.waitingRoomManagerService.startGame();
    }

    goToGame(info: { isCoop: boolean, roomCode?: string }) {
        this.gameStateService.setCoop(info.isCoop);
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
