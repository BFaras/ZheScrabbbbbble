import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameType } from '@app/classes/game-settings';
import { WaitingRoom } from '@app/classes/waiting-room';
import { RoomVisibility } from '@app/constants/room-visibility';
import { JoinResponse, WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
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
    subscription: Subscription;
    gameType: GameType;
    buttonDisabled : boolean;

    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router) {}

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.buttonDisabled = false;
        this.subscription = this.waitingRoomManagerService.getWaitingRoomObservable().subscribe((rooms : WaitingRoom[]) => {
            const waitingGames : WaitingRoom[] = [];
            const fullGames : WaitingRoom[] = [];
            const startedGames : WaitingRoom[] = [];
            for(let room of rooms){
                if(room.isStarted){
                    startedGames.push(room);
                }else if(room.players.length >= 4){
                    fullGames.push(room);
                }else{
                    waitingGames.push(room)
                }
            }
            this.waitingRooms = waitingGames.concat(fullGames).concat(startedGames);
        });
        this.waitingRoomManagerService.getGameRoomActive()
    }

    sendRoomData(room: WaitingRoom) {
        if(this.buttonDisabled) return;
        this.buttonDisabled = true;
        let password;
        if(room.visibility === RoomVisibility.PROTECTED){
            password = prompt('Cette salle est protégée. Veuillez entrer le mot de passe.');
            if(!password){
                alert('Le champ ne peux pas être vide');
                this.buttonDisabled = false;
                return;
            }
        }
        this.waitingRoomManagerService.joinRoomResponse().subscribe(this.redirectPlayer.bind(this));
        this.waitingRoomManagerService.joinRoom(room.id, password);
    }

    redirectPlayer(message : JoinResponse) {
        this.buttonDisabled = false;
        if (message.errorCode === 'ROOM-2') {
            alert('Mot de passe incorrect');
            return;
        }
        if (message.errorCode === 'ROOM-4') {
            alert('Cette salle de jeu est pleine');
            return;
        }
        if(!message.playerNames){
            // Should never reach here
            alert('Fatal server error. No player name received');
            return;
        }
        this.waitingRoomManagerService.setPlayersInRoom(message.playerNames);
        this.router.navigate(['/waiting-room']);
    }
}
