import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameType } from '@app/classes/game-settings';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { AccountService } from '@app/services/account-service/account.service';

import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(private dialog: MatDialog, private socketManager: SocketManagerService, private accountService: AccountService) {
        this.accountService.setUpSocket()
    }

    openScores() {
        this.dialog.open(LeaderboardComponent, {
            width: '30%',
            height: '500px',
        });
    }

    goToProfilePage() {
        this.accountService.askProfileInformation()
    }

    get gameTypeEnum(): typeof GameType {
        return GameType;
    }

    disconnectUser() {
        this.socketManager.getSocket().disconnect();
        this.socketManager.createSocket();
    }
}
