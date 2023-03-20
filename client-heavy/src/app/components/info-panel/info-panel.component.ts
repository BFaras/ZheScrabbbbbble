import { Component, OnDestroy } from '@angular/core';
import { AccountService } from '@app/services/account-service/account.service';
import { GameState, GameStateService } from '@app/services/game-state-service/game-state.service';
import { Subscription } from 'rxjs';
import { Player } from './players-info';
import { Round, roundInfo } from './round-info';

//const DISCONNECT_SCORE = -1000;
//const LOWEST_POSSIBLE_SCORE = -70;

@Component({
    selector: 'app-info-panel',
    templateUrl: './info-panel.component.html',
    styleUrls: ['./info-panel.component.scss'],
})
export class InfoPanelComponent implements OnDestroy {
    playersInfo: Player[] = [];
    roundInfo: Round[] = roundInfo;
    subscriptions: Subscription[] = [];

    constructor(private readonly gameStateService: GameStateService, private readonly accountService: AccountService) {
        this.subscriptions.push(this.gameStateService.getGameStateObservable().subscribe((gameState) => {
            this.updateTurnDisplay(gameState);
        }));
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    isPlayerUser(player : Player){
        if(this.gameStateService.isObserver()){
            return false
        }
        return player.name === this.accountService.getUsername();
    }

    private endGame(gameState: GameState) {
        let highestScore = -Infinity;
        for (const player of gameState.players) {
            if (player.score > highestScore) {
                highestScore = player.score;
            }
        }
        for (let i = 0; i < gameState.players.length; i++) {
            this.playersInfo[i].active = false;
            this.playersInfo[i].winner = gameState.players[i].score === highestScore;
            this.playersInfo[i].currentScore = gameState.players[i].score;
        }
    }

    private updateTurnDisplay(gameState: GameState) {
        const initialLength = this.playersInfo.length;
        for (let i = 0; i < (gameState.players.length - initialLength); i++) {
            this.playersInfo.push({
                name: 'Joueur',
                currentScore: 0,
                letterCount: 0,
                active: false,
                winner: false,
            });
        }
        this.roundInfo[0].lettersRemaining = gameState.reserveLength;
        if (gameState.gameOver) {
            this.endGame(gameState);
            return;
        }
        for (let i = 0; i < gameState.players.length; i++) {
            this.playersInfo[i].winner = false;
            this.playersInfo[i].currentScore = gameState.players[i].score;
            this.playersInfo[i].active = gameState.playerTurnIndex === i;
            this.playersInfo[i].letterCount = gameState.players[i].hand.length;
            this.playersInfo[i].name = gameState.players[i].username;
        }
    }
}
