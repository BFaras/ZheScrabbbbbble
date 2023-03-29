import { Component } from "@angular/core";
import { Router } from '@angular/router';
import { TournamentService } from "@app/services/tournament-service/tournament.service";

@Component({
    selector: 'app-result-page',
    templateUrl: './result-page.component.html',
    styleUrls: ['./result-page.component.scss'],
})
export class ResultPageComponent {

    placement: string[] = [];

    constructor(private tournamentService: TournamentService, private router: Router) {
        this.placement = this.tournamentService.getTournamentWinners();
    }

    leaveToMenu(){
        this.router.navigate(['/home']);
    }
}