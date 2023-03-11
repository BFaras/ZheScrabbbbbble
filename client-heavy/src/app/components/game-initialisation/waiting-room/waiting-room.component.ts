import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account-service/account.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit {

    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private accountService: AccountService, private router: Router) {}

    ngOnInit(): void {
        this.waitingRoomManagerService.setPlayersInRoom([this.accountService.getUsername()])
    }

    launchGame(): void {
        sessionStorage.clear();
        this.router.navigate(['/game']);
    }

    deleteRoom(): void {
        this.waitingRoomManagerService.deleteRoom();
        this.router.navigate(['/create-game']);
    }

    leaveRoom(): void {
        this.waitingRoomManagerService.setGuestPlayer(false);
        this.waitingRoomManagerService.cancelJoinGameRoom()
        this.router.navigate(['/join-game']);
    }

    getPlayersInRoom(): string[] {
        return this.waitingRoomManagerService.getPlayersInRoom();
    }
}
