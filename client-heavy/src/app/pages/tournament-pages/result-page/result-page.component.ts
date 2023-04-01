import { Component } from "@angular/core";
import { Router } from '@angular/router';
import { AvatarInRoomsService } from "@app/services/avatar-in-rooms.service";
import { TournamentService } from "@app/services/tournament-service/tournament.service";

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
})
export class ResultPageComponent {

    placement: string[] = [];

    constructor(private tournamentService: TournamentService, private router: Router, private avatarInRooms: AvatarInRoomsService) {
        this.placement = this.tournamentService.getTournamentWinners();
    }

    getAvatarOfWinner(username: string) {
        if (this.avatarInRooms.getAvatarUserMap(username))
            return this.avatarInRooms.getAvatarUserMap(username)
        else {
            return "virtual.png"
        }
    }

    leaveToMenu() {
        this.router.navigate(['/home']);
    }
}