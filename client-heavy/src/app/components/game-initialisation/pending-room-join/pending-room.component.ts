import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarInRoomsService } from '@app/services/avatar-in-rooms.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { JoinResponse, WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-pending-room',
    templateUrl: './pending-room.component.html',
    styleUrls: ['./pending-room.component.scss'],
})
export class PendingRoomComponent {
    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router, private avatarInRoomService: AvatarInRoomsService, private chatService : ChatService) {
        this.waitingRoomManagerService.joinRoomResponse().subscribe(this.receiveResponse.bind(this));
    }

    cancelDemand() {
        this.waitingRoomManagerService.cancelJoinGameRoom();
        this.router.navigate(['/join-game']);
    }

    returnToMenu() {
        this.router.navigate(['/join-game']);
    }

    receiveResponse(message: JoinResponse) {
        if (message.errorCode === 'ROOM-3') {
            this.waitingRoomManagerService.setRequestPending(false);
            return;
        }
        if (!message.playerNames) {
            // Should never reach here
            alert('Fatal server error. No player name received');
            return;
        }
        this.waitingRoomManagerService.setDefaultPlayersInRoom(message.playerNames);
        /**d/but partie ajouter : mettre liste dans nom dans service et essayer obtenir les avatar de ceux-ci*/
        this.avatarInRoomService.setUsersInRoom(message.playerNames);
        this.avatarInRoomService.askAllUsersAvatar();
        /**fin partie ajouter*/
        if (this.waitingRoomManagerService.isObserver()) {
            this.router.navigate(['/observer-room']);
        } else {
            this.chatService.setChatInGameRoom(this.waitingRoomManagerService.getRoomToJoinId( ));
            this.router.navigate(['/waiting-room']);
        }
    }

    isRequestPending() {
        return this.waitingRoomManagerService.isRequestPending();
    }
}