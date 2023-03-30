import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WaitingRoom } from '@app/classes/waiting-room';
import { RoomVisibility } from '@app/constants/room-visibility';
import { AvatarInRoomsService } from '@app/services/avatar-in-rooms.service';
import { ChatService } from '@app/services/chat-service/chat.service';
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
    subscriptionAvatars: Subscription;
    waitingRooms: WaitingRoom[] = [];
    subscription: Subscription;

    constructor(private waitingRoomManagerService: WaitingRoomManagerService,
        private router: Router, private dialog: MatDialog,
        private chatService: ChatService,
        private avatarInRoomService: AvatarInRoomsService) {}

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.subscriptionAvatars.unsubscribe();
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
        this.subscriptionAvatars = this.avatarInRoomService.getUsersInRoomAvatarObservable().subscribe((usernameAvatar) => {
            this.avatarInRoomService.setAvatarOfUsers(usernameAvatar);
            console.log("test1")
            console.log(usernameAvatar);
        })
        this.waitingRoomManagerService.getGameRoomActive()
    }

    joinGame(room: WaitingRoom, observer: boolean) {
        this.waitingRoomManagerService.setObserver(observer);
        if (room.visibility === RoomVisibility.PROTECTED) {
            const passwordDialog = this.dialog.open(PasswordInputComponent, { data: room.id, width: '30%', height: '200px' });
            passwordDialog.afterClosed().subscribe(result => {
                if (!result) return;
                this.waitingRoomManagerService.setDefaultPlayersInRoom(result);
                /**d/but partie ajouter : mettre liste dans nom dans service et essayer obtenir les avatar de ceux-ci*/
                this.avatarInRoomService.setUsersInRoom(result);
                this.avatarInRoomService.askAllUsersAvatar();
                /**fin partie ajouter*/
                if (this.waitingRoomManagerService.isObserver()) {
                    this.router.navigate(['/observer-room']);
                } else {
                    this.router.navigate(['/waiting-room']);
                }
            });
        } else if (room.visibility === RoomVisibility.PRIVATE) {
            this.chatService.setChatInGameRoom(room.id);
            this.waitingRoomManagerService.joinRoom(room.id);
            this.waitingRoomManagerService.setRequestPending(true);
            this.router.navigate(['/pending-room']);
        } else {
            this.chatService.setChatInGameRoom(room.id);
            this.waitingRoomManagerService.joinRoomResponse().pipe(first()).subscribe(this.redirectPlayer.bind(this));
            this.waitingRoomManagerService.joinRoom(room.id);
        }
    }

    redirectPlayer(message: JoinResponse) {
        if (message.errorCode === 'ROOM-4') {
            alert('Cette salle de jeu est pleine');
            return;
        }
        if (!message.playerNames) {
            // Should never reach here
            alert('Fatal server error. No player name received');
            return;
        }
        this.waitingRoomManagerService.setDefaultPlayersInRoom(message.playerNames);
        /**d/but partie ajouter : mettre liste dans nom dans service et essayer obtenir les avatar de ceux-ci*/
        console.log('join public game')
        this.avatarInRoomService.setUsersInRoom(message.playerNames);
        console.log(message.playerNames);
        this.avatarInRoomService.askAllUsersAvatar();
        /**fin partie ajouter*/
        if (this.waitingRoomManagerService.isObserver()) {
            this.router.navigate(['/observer-room']);
        } else {
            this.router.navigate(['/waiting-room']);
        }
    }
}
