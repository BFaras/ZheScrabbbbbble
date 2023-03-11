import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent {

    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router) {}

    launchGame(): void {
        sessionStorage.clear();
        this.router.navigate(['/game']);
    }

    leaveRoom(): void {
        this.waitingRoomManagerService.leaveRoom();
        this.router.navigate(['/home']);
    }

    getPlayersInRoom(): string[] {
        return this.waitingRoomManagerService.getPlayersInRoom();
    }
}
