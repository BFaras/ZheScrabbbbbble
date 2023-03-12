import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account-service/account.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent {

    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private accountService: AccountService, private router: Router) {}

    launchGame(): void {
        //this.router.navigate(['/game']);
    }

    leaveRoom(): void {
        this.waitingRoomManagerService.leaveRoom();
        this.router.navigate(['/home']);
    }

    getPlayersInRoom(): string[] {
        return this.waitingRoomManagerService.getPlayersInRoom();
    }

    isHostPlayer(): boolean{
        return this.waitingRoomManagerService.getPlayersInRoom()[0] === this.accountService.getUsername();
    }
}
