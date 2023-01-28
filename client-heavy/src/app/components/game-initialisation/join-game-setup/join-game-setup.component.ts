import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NameValidatorService } from '@app/services/name-validator-service/name-validator.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-join-game-setup',
    templateUrl: './join-game-setup.component.html',
    styleUrls: ['./join-game-setup.component.scss'],
})
export class JoinGameSetupComponent implements OnInit {
    roomName: string = '';
    message: string;
    isGuestPlayerWaiting: boolean = false;
    hostName: string;

    constructor(
        private waitingRoomManagerService: WaitingRoomManagerService,
        private nameValidatorService: NameValidatorService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.isGuestPlayerWaiting = this.waitingRoomManagerService.isGuestPlayer();
        this.roomName = this.waitingRoomManagerService.getRoomToJoin();
        this.hostName = this.waitingRoomManagerService.getHostPlayerName();
        this.message = `La salle que vous allez rejoindre est : ${this.roomName}.\nL'hôte de la salle est : ${this.hostName}.`;
    }

    displayRoomInformation(roomToJoin: string): void {
        this.waitingRoomManagerService.setRoomToJoin(roomToJoin);
    }

    joinRoom(guestPlayerName: string): void {
        if (this.nameValidatorService.validateGuestPlayerName(this.waitingRoomManagerService.getHostPlayerName(), guestPlayerName)) {
            this.waitingRoomManagerService.setMessageSource("Veuillez attendre que l'hôte initialise la partie.");
            this.waitingRoomManagerService.joinRoom(guestPlayerName);
            this.waitingRoomManagerService.setHostPlayer(false);
            this.router.navigate(['/waiting-room']);
        }
    }
}
