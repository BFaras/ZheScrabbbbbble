import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontSizeService } from '@app/services/font-size-service/font-size.service';
import { GameStateService, PlayerMessage } from '@app/services/game-state-service/game-state.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    isReceiver: string;
    endGame: boolean = false;
    subscriptions: Subscription[] = [];
    showPortal = false;
    chatDisplay: boolean = false;
    actionHistory: PlayerMessage[] = [];

    constructor(
        private readonly gameStateService: GameStateService,
        private readonly letterHolderService: LetterHolderService,
        private readonly gridService: GridService,
        private readonly router: Router,
        private readonly fontSize: FontSizeService,
        private readonly waitingRoomManagerService: WaitingRoomManagerService,
        private readonly letterAdderService: LetterAdderService
    ) {}

    ngOnInit() {
        this.subscriptions.push(this.gameStateService.getGameStateObservable().subscribe((gameState) => {
            if (gameState.message) this.actionHistory.push(gameState.message);
            this.endGame = gameState.gameOver;
        }));
        this.subscriptions.push(this.gameStateService.getActionMessageObservable().subscribe((message) => {
            this.actionHistory.push(message);
        }));
        if(this.gameStateService.isTournamentGame()){
            this.waitingRoomManagerService.getStartGameObservable().subscribe(() => {
                this.gameStateService.setObserver(-1);
                this.gameStateService.sendAbandonRequest();
                this.letterAdderService.resetMappedBoard();
                this.gameStateService.requestGameState();
                this.actionHistory = [];
            });
        }
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) subscription.unsubscribe();
    }

    alert() {
        const text = 'Êtes-vous sûr(e) de vouloir quitter la partie? Tout votre progrès sera perdu.';
        if (confirm(text)) {
            this.gameStateService.sendAbandonRequest();
            if (this.gameStateService.isTournamentGame()) {
                this.router.navigate(['/tournament-bracket']);
            } else {
                this.router.navigate(['/home']);
            }
        }
    }

    goHome() {
        this.gameStateService.sendAbandonRequest();
        if (this.gameStateService.isTournamentGame()) {
            this.router.navigate(['/tournament-bracket']);
        } else {
            this.router.navigate(['/home']);
        }
    }

    setReceiver(receiver: string) {
        this.isReceiver = receiver;
    }

    onIncrease() {
        this.fontSize.increaseSize();
        this.letterHolderService.redrawTiles();
        this.gridService.deleteAndRedraw();
    }

    onDecrease() {
        this.fontSize.decreaseSize();
        this.letterHolderService.redrawTiles();
        this.gridService.deleteAndRedraw();
    }

    toggle() {
        this.chatDisplay = !this.chatDisplay;
    }

    isObserver(): boolean {
        return this.gameStateService.getObserverIndex() >= 0;
    }

    formatActionInList(message: string, values: string[]): string {
        for (let i = 0; i < values.length; i++) {
            message = message.replace('$' + i, values[i])
        }
        return message;
    }
}
