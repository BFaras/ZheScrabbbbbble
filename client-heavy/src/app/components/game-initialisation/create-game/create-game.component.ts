import { Component } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { RoomVisibility } from '@app/constants/room-visibility';
import { AccountService } from '@app/services/account-service/account.service';
import { AvatarInRoomsService } from '@app/services/avatar-in-rooms.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent {

    randomName: string;
    visibility: RoomVisibility = RoomVisibility.PUBLIC;
    IsProtectedRoom: boolean = false;
    passwordRoom: string = "";
    gameType : string = 'Classic'

    constructor(
        private waitingRoomManagerService: WaitingRoomManagerService,
        private accountService: AccountService,
        private router: Router,
        private chatService: ChatService,
        private avatarInRoomService: AvatarInRoomsService
    ) {
        console.log(this.accountService.getProfile())
    }


    getVisibilityButtonValue(event: MatRadioChange) {
        this.visibility = event.value;
        this.verifyIsRoomProtected()
    }

    getTypeButtonValue(event: MatRadioChange) {
        this.gameType = event.value;
    }

    verifyIsRoomProtected() {
        if (this.visibility === RoomVisibility.PROTECTED) {
            this.IsProtectedRoom = true;
        }
        else {
            this.IsProtectedRoom = false;
        }
    }

    checkMultiInput(): boolean {
        const roomName = (document.getElementById('room-name') as HTMLInputElement).value;
        return roomName.trim() !== '';
    }

    createMultiRoom(): void {
        const roomNameValue = (document.getElementById('room-name') as HTMLInputElement).value;
        if (this.visibility === RoomVisibility.PROTECTED) {
            this.passwordRoom = (document.getElementById("password-room") as HTMLInputElement).value;
            if (!this.passwordRoom.trim()) {
                this.alertFalseInput();
                return;
            }
        }

        sessionStorage.clear();
        this.waitingRoomManagerService.createRoomResponse().subscribe((response)=> this.redirectPlayer(response));
        this.waitingRoomManagerService.createMultiRoom(roomNameValue, this.visibility, this.passwordRoom, this.gameType);
    }

    alertFalseInput() {
        alert('Veuillez remplir les champs vides.');
    }

    redirectPlayer(message: { codeError: string, roomId: string }) {
        if (message.codeError !== '0') {
            alert('Erreur dans la création de la salle');
            return;
        }
        this.waitingRoomManagerService.setDefaultPlayersInRoom([this.accountService.getUsername()])
        this.avatarInRoomService.setAvatarOfUsers([this.accountService.getProfile().avatar])
        this.chatService.setChatInGameRoom(message.roomId);
        this.router.navigate(['/waiting-room']);
    }
}
