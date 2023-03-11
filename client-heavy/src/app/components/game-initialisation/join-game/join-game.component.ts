import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameType } from '@app/classes/game-settings';
import { WaitingRoom } from '@app/classes/waiting-room';
import { JoinGameSetupComponent } from '@app/components/game-initialisation/join-game-setup/join-game-setup.component';
import { RoomVisibility } from '@app/constants/room-visibility';
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

    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router) {}

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.subscription = this.waitingRoomManagerService.getWaitingRoomObservable().subscribe((rooms : WaitingRoom[]) => {
            const waitingGames : WaitingRoom[] = [];
            const startedGames : WaitingRoom[] = [];
            for(let room of rooms){
                if(room.isStarted){
                    startedGames.push(room);
                }else{
                    waitingGames.push(room);
                }
            }
            waitingGames.concat(startedGames);
            this.waitingRooms = waitingGames;
        });
        this.waitingRoomManagerService.getGameRoomActive()
    }

    sendRoomData(room: WaitingRoom) {
        let password;
        if(room.visibility === RoomVisibility.PROTECTED){
            password = prompt('Cette salle est protégée. Veuillez entrer le mot de passe.');
        }
        console.log(password);
        /**changer tous les sets de waitingroom et getters pour avoir seulement WaitingRoom */
        this.waitingRoomManagerService.setHostPlayerName(room.players[0]);
        this.waitingRoomManagerService.setRoomToJoin(room.name);
        this.waitingRoomManagerService.setVisibility(room.visibility);
        this.waitingRoomManagerService.setIdRoom(room.id);
        this.router.navigate(['/join-game-setup']);
    }
}
