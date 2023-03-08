import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account-service/account.service';
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
    password:string = '';
    visibility:string ;
    constructor(
        private waitingRoomManagerService: WaitingRoomManagerService,
        private nameValidatorService: NameValidatorService,
        private router: Router,
        private accountService:AccountService
    ) {}

    ngOnInit() {
        this.isGuestPlayerWaiting = this.waitingRoomManagerService.isGuestPlayer();
        this.roomName = this.waitingRoomManagerService.getRoomToJoin();
        this.hostName = this.waitingRoomManagerService.getHostPlayerName();
        this.visibility = this.waitingRoomManagerService.getVisibility();
        this.message = `La salle que vous allez rejoindre est : ${this.roomName}.\nL'hôte de la salle est : ${this.hostName}.`;
    }
    verifyIfProtectedRoom(){
        if(this.visibility === "Protected"){
            return true;
        }else{
            return false
        }
    }
    /*meme pas utiliser wtf ca fait quoi ce truc la  */
    displayRoomInformation(roomToJoin: string): void {
        this.waitingRoomManagerService.setRoomToJoin(roomToJoin);
    }

    joinRoom(): void {
        if (this.nameValidatorService.validateGuestPlayerName(this.waitingRoomManagerService.getHostPlayerName(), this.accountService.getUsername())) {
            this.waitingRoomManagerService.setMessageSource("Veuillez attendre que l'hôte initialise la partie.");
            this.waitingRoomManagerService.joinRoom(this.password);
            this.waitingRoomManagerService.setHostPlayer(false);
            this.router.navigate(['/waiting-room']);
        }
    }
}
