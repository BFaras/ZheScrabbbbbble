import { Component } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { RoomVisibility } from '@app/constants/room-visibility';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent {
    buttonDisabled: boolean;
    randomName: string;
    visibility: RoomVisibility = RoomVisibility.PUBLIC;
    IsProtectedRoom: boolean = false;
    passwordRoom: string = "";

    constructor(
        private waitingRoomManagerService: WaitingRoomManagerService,
        private router: Router,
    ) {
        this.buttonDisabled = false;
    }

    getRadioButtonValue(event: MatRadioChange) {
        this.visibility = event.value;
        this.verifyIsRoomProtected()
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
        if (this.buttonDisabled) return;
        this.buttonDisabled = true;
        const roomNameValue = (document.getElementById('room-name') as HTMLInputElement).value;
        if (this.visibility === RoomVisibility.PROTECTED) {
            this.passwordRoom = (document.getElementById("password-room") as HTMLInputElement).value;
        }
        sessionStorage.clear();
        this.waitingRoomManagerService.createRoomResponse().subscribe(this.redirectPlayer.bind(this));
        this.waitingRoomManagerService.createMultiRoom(roomNameValue, this.visibility, this.passwordRoom);
    }

    alertFalseInput() {
        alert('Veuillez remplir les champs vides.');
    }

    redirectPlayer(message: string) {
        this.buttonDisabled = false;
        if (message !== '0') {
            alert('Error in room creation');
            return;
        }
        this.router.navigate(['/waiting-room']);
    }
}
