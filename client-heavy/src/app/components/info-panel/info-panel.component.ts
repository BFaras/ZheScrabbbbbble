import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { GameState, GameStateService } from '@app/services/game-state-service/game-state.service';
import { Subscription } from 'rxjs';
import { Player, playersInfo } from './players-info';
import { Round, roundInfo } from './round-info';

const DISCONNECT_SCORE = -1000;
const LOWEST_POSSIBLE_SCORE = -70;

@Component({
    selector: 'app-info-panel',
    templateUrl: './info-panel.component.html',
    styleUrls: ['./info-panel.component.scss'],
})
export class InfoPanelComponent implements AfterViewInit, OnDestroy {
    playersInfo: Player[] = playersInfo;
    roundInfo: Round[] = roundInfo;
    subscriptions: Subscription[] = [];

    constructor(private readonly gameStateService: GameStateService) {}

    ngAfterViewInit(): void {
        this.subscriptions.push(this.gameStateService.getPlayerNamesListener().subscribe((playerNames) => this.updatePlayerNames(playerNames)));
        this.subscriptions.push(this.gameStateService.getGameStateObservable().subscribe((gameState) => this.updateTurnDisplay(gameState)));
        this.gameStateService.getPlayerNames();
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    private updatePlayerNames(playerNames: string[]) {
        this.playersInfo[0].name = playerNames[0];
        this.playersInfo[1].name = playerNames[1];
    }

    private endGame(gameState: GameState) {
        this.playersInfo[0].active = false;
        this.playersInfo[1].active = false;
        if (gameState.yourScore === gameState.opponentScore) {
            this.playersInfo[0].winner = true;
            this.playersInfo[1].winner = true;
        } else if (gameState.yourScore > gameState.opponentScore) {
            this.playersInfo[0].winner = true;
            this.playersInfo[1].winner = false;
        } else {
            this.playersInfo[1].winner = true;
            this.playersInfo[0].winner = false;
        }

        this.playersInfo[0].currentScore = gameState.yourScore > LOWEST_POSSIBLE_SCORE ? gameState.yourScore : gameState.yourScore - DISCONNECT_SCORE;

        this.playersInfo[1].currentScore =
            gameState.opponentScore > LOWEST_POSSIBLE_SCORE ? gameState.opponentScore : gameState.opponentScore - DISCONNECT_SCORE;
    }

    private standardGameUpdate(gameState: GameState) {
        this.roundInfo[0].lettersRemaining = gameState.reserveLength;
        this.playersInfo[0].letterCount = gameState.hand.length;
        this.playersInfo[1].letterCount = gameState.opponentHandLength;
    }

    private updateTurnDisplay(gameState: GameState) {
        if (!gameState.isYourTurn) this.gameStateService.notifyGameStateReceived();
        this.standardGameUpdate(gameState);
        if (gameState.gameOver) {
            this.endGame(gameState);
            return;
        }

        this.playersInfo[0].winner = false;
        this.playersInfo[1].winner = false;
        this.playersInfo[0].currentScore = gameState.yourScore;
        this.playersInfo[1].currentScore = gameState.opponentScore;
        this.playersInfo[0].active = gameState.isYourTurn;
        this.playersInfo[1].active = !gameState.isYourTurn;
    }
}
