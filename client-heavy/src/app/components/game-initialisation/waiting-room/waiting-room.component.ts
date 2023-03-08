import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit {
    message: string = '';
    alertMessage: string = '';
    isHostPlayerWaiting: boolean = false;
    isGuestPlayerWaiting: boolean = false;

    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router) {}

    ngOnInit(): void {
        this.message = this.waitingRoomManagerService.getMessageSource();
        this.isHostPlayerWaiting = this.waitingRoomManagerService.isHostPlayer();
        this.waitingRoomManagerService.getJoinedPlayer().subscribe((playerName) => this.updateJoinMessage(playerName));
        this.waitingRoomManagerService.getJoinResponse().subscribe((answer) => this.manageJoinResponse(answer));
        this.waitingRoomManagerService.getGuestPlayerLeft().subscribe((answer) => this.updateWaitingStatus(answer));
    }

    updateWaitingStatus(answer: string): void {
        this.isGuestPlayerWaiting = false;
        this.message = answer;
    }

    launchGame(): void {
        this.waitingRoomManagerService.answerGuestPlayer(true);
        sessionStorage.clear();
        this.router.navigate(['/game']);
    }

    denyPlayer(): void {
        this.waitingRoomManagerService.answerGuestPlayer(false);
        this.waitingRoomManagerService.setGuestPlayer(false);
        this.isGuestPlayerWaiting = false;
        this.waitingRoomManagerService.setMessageSource("Veuillez attendre qu'un joueur rejoigne votre salle.");
        this.message = this.waitingRoomManagerService.getMessageSource();
    }

    convertMultiToSolo(): void {
        this.waitingRoomManagerService.convertMultiToSolo();
        this.router.navigate(['/create-game']);
        this.waitingRoomManagerService.deleteRoom();
    }

    deleteRoom(): void {
        this.waitingRoomManagerService.answerGuestPlayer(false);
        this.waitingRoomManagerService.deleteRoom();
        this.router.navigate(['/create-game']);
    }

    leaveRoom(): void {
        this.waitingRoomManagerService.setGuestPlayer(false);
        this.isGuestPlayerWaiting = false;
        this.waitingRoomManagerService.updateWaitingRoom("Veuillez attendre qu'un joueur rejoigne votre salle.");
        this.message = this.waitingRoomManagerService.getMessageSource();
        this.waitingRoomManagerService.cancelJoinGameRoom()
        this.router.navigate(['/join-game']);
    }

    private updateJoinMessage(playerName: string) {
        
        this.isGuestPlayerWaiting = this.waitingRoomManagerService.isGuestPlayer();
        if (this.isGuestPlayerWaiting) this.message = `${playerName} tente de rejoindre votre partie`;
        else this.message = "Veuillez attendre qu'un joueur rejoigne votre salle.";
    }

    private manageJoinResponse(answer: boolean) {
        console.log(answer);
        if (answer) {
            sessionStorage.clear();
            this.router.navigate(['/game']);
        } else {
            alert(this.waitingRoomManagerService.getAlertMessage());
            this.router.navigate(['/join-game']);
        }
    }
}
