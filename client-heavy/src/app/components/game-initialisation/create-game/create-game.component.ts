import { Component } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent {
    buttonDisabled: boolean;
    randomName: string;
    visibility: string = "Public";
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
        if (this.visibility === "Protected") {
            this.IsProtectedRoom = true;
        }
        else {
            this.IsProtectedRoom = false;
        }
    }

    checkSoloInput(playerName: string): boolean {
        return playerName.trim() !== '';
    }

    checkMultiInput(): boolean {
        const roomName = (document.getElementById('room-name') as HTMLInputElement).value;
        return roomName.trim() !== '';
    }

    createMultiRoom(): void {
        if (this.buttonDisabled) return;
        this.buttonDisabled = true;
        const roomNameValue = (document.getElementById('room-name') as HTMLInputElement).value;
        if (this.visibility === "Protected") {
            this.passwordRoom = (document.getElementById("password-room") as HTMLInputElement).value;
        }
        sessionStorage.clear();
        this.waitingRoomManagerService.createRoomResponse().subscribe(this.redirectPlayer);
        this.waitingRoomManagerService.createMultiRoom(roomNameValue, this.visibility, this.passwordRoom);
    }

    alertFalseInput() {
        alert('Veuillez remplir les champs vides.');
    }

    redirectPlayer(message: string) {
        if (message !== '0') {
            console.log(message);
            alert('Error in room creation');
            return;
        }
        console.log('Test');
        console.log(this.router);
        this.router.navigate(['/waiting-room']);
    }
}
