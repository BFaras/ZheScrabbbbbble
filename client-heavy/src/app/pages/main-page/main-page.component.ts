import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { GameType } from '@app/constants/game-types';

import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(private dialog: MatDialog, private socketManager: SocketManagerService) {}

    openScores() {
        this.dialog.open(LeaderboardComponent, {
            width: '30%',
            height: '500px',
        });
    }

    get gameTypeEnum(): typeof GameType {
        return GameType;
    }

    disconnectUser() {
        this.socketManager.getSocket().disconnect();
        this.socketManager.createSocket();
    }
}
