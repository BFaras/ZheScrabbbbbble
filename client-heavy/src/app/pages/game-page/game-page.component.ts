import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfrimPopUpComponent } from '@app/components/confrim-pop-up/confrim-pop-up.component';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
//import { ConfirmationDialogHandlerService } from '@app/services/confirmation-dialog-handler.service';
import { FontSizeService } from '@app/services/font-size-service/font-size.service';
import { GameStateService, PlayerMessage } from '@app/services/game-state-service/game-state.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { TranslateService } from '@ngx-translate/core';
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

    hasPendingAction: boolean;

    constructor(
        private readonly gameStateService: GameStateService,
        private readonly letterHolderService: LetterHolderService,
        private readonly gridService: GridService,
        private readonly router: Router,
        private readonly fontSize: FontSizeService,
        private readonly waitingRoomManagerService: WaitingRoomManagerService,
        private readonly letterAdderService: LetterAdderService,
        private readonly accountService: AccountService,
        private readonly translate: TranslateService,
        private readonly chatService: ChatService,
        private readonly changeDetector: ChangeDetectorRef,
        //private readonly confirmationHandler: ConfirmationDialogHandlerService,
        public dialog: MatDialog
    ) {
        this.chatService.setChangeDetector(this.changeDetector);
    }



    ngOnInit() {
        this.hasPendingAction = false;
        this.gameStateService.setPendingAction(false);
        this.subscriptions.push(this.gameStateService.getGameStateObservable().subscribe((gameState) => {
            if (gameState.message) this.actionHistory.push(gameState.message);
            this.clearHints();
            this.endGame = gameState.gameOver;
        }));
        this.subscriptions.push(this.gameStateService.getActionMessageObservable().subscribe((message) => {
            if (message.messageType === 'MSG-13') {
                this.letterAdderService.removeAll();
                this.gameStateService.setPendingAction(true);
            }
            if (message.messageType === 'MSG-12' || message.messageType === 'MSG-14') {
                this.gameStateService.setPendingAction(false);
                this.hasPendingAction = false;
            }
            if (message.messageType === 'MSG-13' && this.gameStateService.getObserverIndex() === -1 && message.values[0] !== this.accountService.getUsername()) {
                this.hasPendingAction = true;
            }
            this.actionHistory.push(message);
        }));
        this.subscriptions.push(this.gameStateService.getClueObservable().subscribe((clues: string[]) => {
            this.actionHistory.push({ messageType: 'MSG-CLUE', values: clues });
        }))
        if (this.gameStateService.isTournamentGame()) {
            this.waitingRoomManagerService.getStartGameObservable().subscribe((info: { isCoop: boolean, roomCode?: string }) => {
                if (info.roomCode) this.chatService.setChatInGameRoom(info.roomCode);
                this.gameStateService.setCoop(info.isCoop);
                this.gameStateService.setObserver(-1);
                this.gameStateService.sendAbandonRequest();
                this.letterAdderService.resetMappedBoard();
                this.gameStateService.requestGameState();
                this.actionHistory = [];
            });
        }
    }

    isPopupOpen(): boolean {
        return this.chatService.isPopupOpen();
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) subscription.unsubscribe();
    }

    alert() {
        const text = this.accountService.getLanguage() === 'fr' ? 'Êtes-vous sûr(e) de vouloir quitter la partie? Tout votre progrès sera perdu.' : 'Are you sure you want to quit? All progress will be lost.';

        const dialogRef = this.dialog.open(ConfrimPopUpComponent, {
            width: '450px',
            height: '230px',
            data: { notification: text }
        });

        console.log("I sent deamnde to open dialog")

        dialogRef.afterClosed().subscribe(result => {
            console.log("subscription works")
            console.log(result)
            if (result === undefined) {
                this.dialogResponse(false)
            } else {
                console.log("I clicked on Ok or No")
                this.dialogResponse(result.status);
            }
        });
    }

    dialogResponse(status: boolean) {
        console.log("I am in dialogRespnse ")
        if (status) {
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

    answerPendingAction(answer: boolean) {
        if (!this.hasPendingAction) return;
        this.hasPendingAction = false;
        this.gameStateService.respondCoopAction(answer);
    }

    isLatestProposedAction(index: number) {
        if (this.actionHistory[index].messageType !== 'MSG-13') return false;
        for (let i = this.actionHistory.length - 1; i >= 0; i--) {
            if (this.actionHistory[i].messageType === 'MSG-13') {
                return i === index;
            }
        }
        return false;
    }

    formatActionInList(message: string, values: string[], messageType: string): string {
        for (let i = 0; i < values.length; i++) {
            if (i === 0) {
                if (!values[i]) {
                    message = message.replace('$' + i, this.translate.instant('INFOBOARD.COOP-TEAM'));
                    continue;
                }
                const messageArray = values[i].split(' : ');
                if (messageArray[0] === '\n') {
                    message = message.replace('$' + i, '\n' + this.translate.instant('INFOBOARD.COOP-TEAM') + ' : ' + messageArray[1]);
                    continue;
                }
            }
            if (i === 1 && messageType === 'MSG-13') {
                const messageArray = values[i].split(' ');
                messageArray[0] = this.translate.instant('ACTION-HISTORY.' + messageArray[0].toUpperCase());
                let combinedMessage = '';
                for (const msg of messageArray) {
                    combinedMessage += msg + ' '
                }
                message = message.replace('$' + i, combinedMessage);
                continue;
            }
            message = message.replace('$' + i, values[i])
        }
        return message;
    }

    playHint(command: string) {
        this.clearHints();
        this.chatService.sendCommand(command.substring(command.indexOf(' ') + 1), command.split(' ')[0]);
    }

    clearHints() {
        for (let i = 0; i < this.actionHistory.length; i++) {
            if (this.actionHistory[i].messageType === 'MSG-CLUE') {
                this.actionHistory.splice(i, 1);
                ReadableStreamDefaultController;
            }
        }
    }
}
