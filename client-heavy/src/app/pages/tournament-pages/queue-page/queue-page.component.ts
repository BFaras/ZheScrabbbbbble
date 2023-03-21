import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentService } from '@app/services/tournament-service/tournament.service';

@Component({
    selector: 'app-queue-page',
    templateUrl: './queue-page.component.html',
    styleUrls: ['./queue-page.component.scss'],
})
export class QueuePageComponent {
    constructor(private tournamentService: TournamentService, private router: Router) {
        this.router.navigate(['/tournament-bracket']);
        this.tournamentService.tournamentFoundObservable().subscribe(() => {
            
        });
        this.tournamentService.enterTournament();
    }

    cancelQueue(){
        this.tournamentService.leaveTournament();
        this.router.navigate(['/home']);
    }

    leaveRoomLogic(): void {
        this.tournamentService.leaveTournament();
    }
}