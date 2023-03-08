import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Player, playersInfo } from '@app/components/info-panel/players-info';
import { FontSizeService } from '@app/services/font-size-service/font-size.service';
import { GameStateService } from '@app/services/game-state-service/game-state.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    isReceiver: string;
    playersInfo: Player[] = playersInfo;
    endGame: boolean = false;
    subscriptions: Subscription[] = [];
    showPortal = false;

    constructor(
        private readonly gameStateService: GameStateService,
        private readonly letterHolderService: LetterHolderService,
        private readonly gridService: GridService,
        private readonly router: Router,
        private readonly fontSize: FontSizeService,
        public translate: TranslateService
    ) {
        translate.addLangs(['en', 'fr']);
    }

    ngOnInit() {
        const id = sessionStorage.getItem('playerID');
        if (id) this.gameStateService.reconnect(id);
        this.subscriptions.push(this.gameStateService.getPlayerID().subscribe((newID) => sessionStorage.setItem('playerID', newID)));
        this.subscriptions.push(this.gameStateService.getGameStateObservable().subscribe((gameState) => (this.endGame = gameState.gameOver)));
        this.gameStateService.requestId();
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) subscription.unsubscribe();
    }

    alert() {
        const text = 'Êtes-vous sûr(e) de vouloir quitter la partie? Tout votre progrès sera perdu.';
        if (confirm(text)) {
            this.gameStateService.sendAbandonRequest();
            this.router.navigate(['/home']);
        }
    }

    goHome() {
        this.gameStateService.sendAbandonRequest();
        this.router.navigate(['/home']);
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

    translateLanguageTo(lang: string) {
        this.translate.use(lang);
    }

    toggle() {
        let element = document.getElementById("myChat");
        if (element!.style.display == "block") {
            element!.style.display = "none";
        } else {
            element!.style.display = "block";
        }
    }

}
