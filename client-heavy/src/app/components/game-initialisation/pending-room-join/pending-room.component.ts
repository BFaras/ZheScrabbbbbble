import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JoinResponse, WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-pending-room',
    templateUrl: './pending-room.component.html',
    styleUrls: ['./pending-room.component.scss'],
})
export class PendingRoomComponent {
    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router) {
        this.waitingRoomManagerService.joinRoomResponse().subscribe(this.receiveResponse.bind(this));
    }

    cancelDemand(){
        this.waitingRoomManagerService.cancelJoinGameRoom();
        this.router.navigate(['/join-game']);
    }

    returnToMenu(){
        this.router.navigate(['/join-game']);
    }

    receiveResponse(message : JoinResponse) {
        if(message.errorCode === 'ROOM-3'){
            this.waitingRoomManagerService.setRequestPending(false);
            return;
        }
        if(!message.playerNames){
            // Should never reach here
            alert('Fatal server error. No player name received');
            return;
        }
        this.waitingRoomManagerService.setPlayersInRoom(message.playerNames);
        this.router.navigate(['/waiting-room']);
    }

    isRequestPending(){
        return this.waitingRoomManagerService.isRequestPending();
    }
}