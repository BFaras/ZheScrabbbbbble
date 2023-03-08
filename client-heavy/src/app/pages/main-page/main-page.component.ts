import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameType } from '@app/classes/game-settings';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { AccountService } from '@app/services/account-service/account.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    subscriptionProfileInformation:Subscription;
    constructor(private router:Router,private dialog: MatDialog, private gameModeService: GameModeService, private socketManager: SocketManagerService,private accountService:AccountService) {
        this.accountService.setUpSocket()
        this.subscriptionProfileInformation = this.accountService.getUserProfileInformation().
        subscribe((userProfile)=>{
            console.log('test1');
            this.accountService.setUpProfile(userProfile);
            console.log(this.accountService.getProfile());
            this.router.navigate(['/profile']);
            })
        
    }

    openScores() {
        this.dialog.open(LeaderboardComponent, {
            width: '30%',
            height: '500px',
        });
    }

    goToProfilePage(){
        this.accountService.askProfileInformation()
    }

    setScrabbleMode(scrabbleMode: GameType): void {
        this.gameModeService.setScrabbleMode(scrabbleMode);
    }

    get gameTypeEnum(): typeof GameType {
        return GameType;
    }
    disconnectUser() {
        this.socketManager.getSocket().disconnect();
        this.socketManager.createSocket();

    }
}
