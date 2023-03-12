import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account-service/account.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent {

    pendingRequests: string[] = [];

    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private accountService: AccountService, private router: Router) {
        this.waitingRoomManagerService.getJoinRoomRequestObservable().subscribe(this.newJoinRequest.bind(this));
    }

    launchGame(): void {
        //this.refuseEveryone();
        //this.router.navigate(['/game']);
    }

    leaveRoom(): void {
        this.refuseEveryone();
        this.waitingRoomManagerService.leaveRoom();
        this.router.navigate(['/home']);
    }

    getPlayersInRoom(): string[] {
        return this.waitingRoomManagerService.getPlayersInRoom();
    }

    isHostPlayer(): boolean{
        return this.waitingRoomManagerService.getPlayersInRoom()[0] === this.accountService.getUsername();
    }

    newJoinRequest(username: string){
        this.pendingRequests.push(username);
    }

    respondNextRequest(response: boolean){
        const username = this.pendingRequests.shift();
        if(!username) return;
        this.waitingRoomManagerService.respondJoinRequest(response, username);
        if(response && this.waitingRoomManagerService.getPlayersInRoom().length >= 3){
            this.refuseEveryone();
        }
    }

    private refuseEveryone(){
        for(let username of this.pendingRequests){
            this.waitingRoomManagerService.respondJoinRequest(false, username);
        }
        this.pendingRequests = [];
    }
}
