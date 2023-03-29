import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameType } from '@app/classes/game-settings';
import { ProfileSettings } from '@app/classes/profileInfo';
import { LanguageComponent } from '@app/components/language/language.component';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { AccountService } from '@app/services/account-service/account.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Subscription } from 'rxjs';
import { ProfilePageComponent } from '../profile-page/profile-page.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    subscriptions: Subscription[] = [];

    constructor(
        private dialog: MatDialog,
        private socketManager: SocketManagerService,
        private accountService: AccountService,
        private profile: ProfilePageComponent,
        private language: LanguageComponent) {
        this.accountService.setUpSocket()
        this.subscriptions.push(this.accountService.getUserProfileInformation().
            subscribe((userProfile) => {
                this.accountService.setUpProfile(userProfile);
            }));
        this.subscriptions.push(this.accountService.getThemeAndLanguage().subscribe((profile: ProfileSettings) => {
            console.log(profile);
            this.profile.changeThemeTo(profile.theme);
            this.language.translateLanguageTo(profile.language);
        }));
    }

    openScores() {
        this.dialog.open(LeaderboardComponent, {
            width: '30%',
            height: '500px',
        });
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) subscription.unsubscribe();
    }

    get gameTypeEnum(): typeof GameType {
        return GameType;
    }

    disconnectUser() {
        this.socketManager.getSocket().disconnect();
        this.socketManager.createSocket();
    }
}
