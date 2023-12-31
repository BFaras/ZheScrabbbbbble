import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WaitingRoom } from '@app/classes/waiting-room';
import { RoomVisibility } from '@app/constants/room-visibility';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { SnackBarHandlerService } from '@app/services/snack-bar-handler.service';
import { JoinResponse, WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { PasswordInputComponent } from '../password-input-dialog/password-input.component';

@Component({
    selector: 'app-join-game',
    templateUrl: './join-game.component.html',
    styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent implements OnDestroy {
    @Input() hostName: string = '';
    @Input() roomName: string = '';
    waitingRooms: WaitingRoom[] = [];
    subscription: Subscription;

    constructor(private waitingRoomManagerService: WaitingRoomManagerService,
        private router: Router, private dialog: MatDialog,
        private chatService: ChatService,
        private snackBarHandler: SnackBarHandlerService,
        private accountService: AccountService
    ) {}

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.snackBarHandler.closeAlert()
    }

    ngOnInit() {
        this.subscription = this.waitingRoomManagerService.getWaitingRoomObservable().subscribe((rooms: WaitingRoom[]) => {
            const waitingGames: WaitingRoom[] = [];
            const fullGames: WaitingRoom[] = [];
            const startedGames: WaitingRoom[] = [];
            for (let room of rooms) {
                if (room.isStarted) {
                    if (room.visibility === RoomVisibility.PRIVATE) continue;
                    startedGames.push(room);
                } else if (room.players.length >= 4) {
                    fullGames.push(room);
                } else {
                    waitingGames.push(room)
                }
            }
            this.waitingRooms = waitingGames.concat(fullGames).concat(startedGames);
        });
        this.waitingRoomManagerService.getGameRoomActive()
    }

    joinGame(room: WaitingRoom, observer: boolean) {
        this.waitingRoomManagerService.setRoomToJoinId(room.id);
        this.waitingRoomManagerService.setObserver(observer);
        if (room.visibility === RoomVisibility.PROTECTED) {
            const passwordDialog = this.dialog.open(PasswordInputComponent, { data: room.id, width: '30%', height: '200px' });
            passwordDialog.afterClosed().subscribe(result => {
                if (!result) return;
                this.waitingRoomManagerService.setDefaultPlayersInRoom(result);
                this.chatService.setChatInGameRoom(this.waitingRoomManagerService.getRoomToJoinId());
                if (this.waitingRoomManagerService.isObserver()) {
                    this.router.navigate(['/observer-room']);
                } else {
                    this.router.navigate(['/waiting-room']);
                }
            });
        } else if (room.visibility === RoomVisibility.PRIVATE) {
            this.waitingRoomManagerService.joinRoom(room.id);
            this.waitingRoomManagerService.setRequestPending(true);
            this.router.navigate(['/pending-room']);
        } else {
            this.waitingRoomManagerService.joinRoomResponse().pipe(first()).subscribe(this.redirectPlayer.bind(this));
            this.waitingRoomManagerService.joinRoom(room.id);
        }
    }

    redirectPlayer(message: JoinResponse) {
        this.accountService.setMessages();
        if (message.errorCode === 'ROOM-4') {
            this.snackBarHandler.makeAnAlert(this.accountService.messageFull, this.accountService.closeMessage)
            return;
        }
        if (!message.playerNames) {
            // Should never reach here
            this.snackBarHandler.makeAnAlert('Fatal server error. No player name received', "Fermer")
            return;
        }
        this.waitingRoomManagerService.setDefaultPlayersInRoom(message.playerNames);
        this.chatService.setChatInGameRoom(this.waitingRoomManagerService.getRoomToJoinId());
        if (this.waitingRoomManagerService.isObserver()) {
            this.router.navigate(['/observer-room']);
        } else {
            this.router.navigate(['/waiting-room']);
        }
    }
}
