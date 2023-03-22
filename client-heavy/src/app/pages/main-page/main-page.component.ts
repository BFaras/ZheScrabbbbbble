import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
    subscriptionProfileInformation: Subscription;
    themeLanguageSubscription: Subscription;

    constructor(private router: Router,
        private dialog: MatDialog,
        private socketManager: SocketManagerService,
        private accountService: AccountService,
        private profile: ProfilePageComponent,
        private language: LanguageComponent) {
        this.accountService.setUpSocket()
        this.subscriptionProfileInformation = this.accountService.getUserProfileInformation().
            subscribe((userProfile) => {
                this.accountService.setUpProfile(userProfile);
                this.router.navigate(['/profile-page']);
            });
        this.themeLanguageSubscription = this.accountService.getThemeAndLanguage().subscribe((profile: ProfileSettings) => {
            this.profile.changeThemeTo(profile.theme);
            this.language.translateLanguageTo(profile.language);
            console.log(profile);
        });
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
