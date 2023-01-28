import { Component, OnInit } from '@angular/core';
import { GameType } from '@app/constants/game-types';
import { LeaderboardService, TopScores } from '@app/services/leaderboard-service/leaderboard.service';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
    scores: string[] = [];
    gameType: GameType;

    constructor(private readonly leaderboardService: LeaderboardService) {}

    ngOnInit(): void {
        this.setGameType(GameType.CLASSIC);
        this.leaderboardService.getTopScoresObservable().subscribe((topScores) => this.updateScores(topScores));
    }

    updateScores(topScores: TopScores) {
        const scores: string[] = [];
        const orderedKeys = Object.keys(topScores).reverse();
        for (const key of orderedKeys) {
            let position = `${key} :`;
            const names = topScores[key];
            for (const name of names) {
                position += ` ${name},`;
            }
            position = position.substring(0, position.length - 1);
            scores.push(position);
        }
        this.scores = scores;
    }

    setGameType(gameType: GameType) {
        this.gameType = gameType;
        this.leaderboardService.requestTopScores(gameType);
    }

    get gameTypeEnum(): typeof GameType {
        return GameType;
    }
}
