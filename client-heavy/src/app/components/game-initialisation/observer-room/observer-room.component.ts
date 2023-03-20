import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-observer-room',
    templateUrl: './observer-room.component.html',
    styleUrls: ['./observer-room.component.scss'],
})
export class ObserverRoomComponent {
    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router) {
        
    }

    cancelObservation(){
        this.waitingRoomManagerService.leaveRoom();
        this.router.navigate(['/join-game']);
    }

    leaveRoomLogic(): void {
        this.waitingRoomManagerService.leaveRoom();
    }
}