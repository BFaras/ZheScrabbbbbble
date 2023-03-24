import { Component } from "@angular/core";
import { GameData, GameStatus } from "@app/services/tournament-service/tournament.service";

@Component({
    selector: 'app-bracket-page',
    templateUrl: './bracket-page.component.html',
    styleUrls: ['./bracket-page.component.scss'],
})
export class BracketPageComponent {
    semi1 : GameData;
    semi2 : GameData;
    final1 : GameData;
    final2 : GameData;
    private games : GameData[]= [];

    constructor(){
        this.setupGames();
    }

    setupGames() {
        let s1 = false;
        let s2 = false;
        let f1 = false;
        let f2 = false;
        for(let game of this.games){
            switch(game.type){
                case 'Semi1':
                    s1 = true;
                    this.semi1 = game;
                    break;
                case 'Semi2':
                    s2 = true;
                    this.semi2 = game;
                    break;
                case 'Final1':
                    f1 = true;
                    this.final1 = game;
                    break;
                case 'Final2':
                    f2 = true;
                    this.final2 = game;
                    break;
            }
        }
        if(!s1) this.semi1 = {type: 'Semi1', status: GameStatus.IN_PROGRESS, winnerIndex: 0, players: ['Manuel', 'Manuel2'], roomCode: ''};
        if(!s2) this.semi2 = {type: 'Semi2', status: GameStatus.FINISHED, winnerIndex: 0,  players: ['Manuel3', 'Manuel4'], roomCode: ''};
        if(!f1) this.final1 = {type: 'Final1', status: GameStatus.PENDING, winnerIndex: 0, players: ['Manuel3', ''], roomCode: ''};
        if(!f2) this.final2 = {type: 'Final2', status: GameStatus.PENDING, winnerIndex: 0, players: ['Manuel4', ''], roomCode: ''};
    }

}