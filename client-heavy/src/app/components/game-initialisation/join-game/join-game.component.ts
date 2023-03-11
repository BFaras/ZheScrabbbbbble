import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameType } from '@app/classes/game-settings';
import { WaitingRoom } from '@app/classes/waiting-room';
import { JoinGameSetupComponent } from '@app/components/game-initialisation/join-game-setup/join-game-setup.component';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-join-game',
    templateUrl: './join-game.component.html',
    styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent implements OnDestroy, OnInit {
    @Input() hostName: string = '';
    @Input() roomName: string = '';

    waitingRooms: WaitingRoom[] = [];
    joinGameSetUpComponent: JoinGameSetupComponent;
    subscription: Subscription;
    gameType: GameType;

    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router, private gameModeService: GameModeService) {}

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.gameType = this.gameModeService.scrabbleMode;
        this.subscription = this.waitingRoomManagerService.getWaitingRoomObservable().
            subscribe((rooms) => {
                this.waitingRooms = rooms;
                console.log(rooms)
            });
        this.waitingRoomManagerService.getGameRoomActive()
    }

    sendRoomData(room: WaitingRoom) {
        /**changer tous les sets de waitingroom et getters pour avoir seulement WaitingRoom */
        this.waitingRoomManagerService.setHostPlayerName(room.players[0]);
        this.waitingRoomManagerService.setRoomToJoin(room.name);
        this.waitingRoomManagerService.setVisibility(room.visibility);
        this.waitingRoomManagerService.setIdRoom(room.id);
        this.router.navigate(['/join-game-setup']);
    }

    placeRandomly() {
        const randomRoom: WaitingRoom = this.waitingRooms[Math.floor(Math.random() * this.waitingRooms.length)];
        this.sendRoomData(randomRoom);
    }
}
