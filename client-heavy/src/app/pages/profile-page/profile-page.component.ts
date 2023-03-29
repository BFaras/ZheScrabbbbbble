import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { connectionHistory } from '@app/classes/connection-history';
import { ProfileInfo } from '@app/classes/profileInfo';
import { ChangeNamePopUpComponent } from '@app/components/change-name-pop-up/change-name-pop-up.component';
import { AvatarPopUpComponent } from '@app/components/profil-pop-up/avatar-pop-up/avatar-pop-up.component';
import { NO_ERROR, USERNAME_TAKEN } from '@app/constants/error-codes';
import { Theme } from '@app/constants/themes';
import { AccountService } from '@app/services/account-service/account.service';
import { ThemesService } from '@app/services/themes-service/themes-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  accountProfile: ProfileInfo
  accountUsername: string;
  errorCodeUsername: string
  subscriptionChangeAvatar: Subscription;
  subscriptionUsername: Subscription;
  progressionBarValue: number
  connectionHistory: connectionHistory = {
    connections: [],
    disconnections: [],
  };
  constructor(private accountService: AccountService,
    public dialog: MatDialog,
    private themeService: ThemesService,
    private router: Router) {}

  ngOnDestroy() {
    this.subscriptionChangeAvatar.unsubscribe();
    this.subscriptionUsername.unsubscribe()
  }

  openDialogChangeName(): void {
    const dialogRef = this.dialog.open(ChangeNamePopUpComponent, {
      width: '250px',
      height: '250px',
      data: { accountService: this.accountService }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(this.errorCodeUsername)
      if (result.name && this.errorCodeUsername === "0") {
        this.accountService.setUsername(result.name);
        this.getUserName();
      }
    });

  }

  openDialogChangeColor(): void {
    const dialogReference = this.dialog.open(AvatarPopUpComponent, {
      width: '900px',
      height: '600px',
      data: { accountService: this.accountService }
    });
    dialogReference.afterClosed().subscribe(result => {
      if (result.avatar) {
        this.accountProfile.avatar = result.avatar;
      }
    });

  }

  getUserName() {
    this.accountUsername = this.accountService.getUsername();
  }

  ngOnInit(): void {
    this.subscriptionChangeAvatar = this.accountService.getAvatarChangeStatus()
      .subscribe((errorCode: string) => {
        if (errorCode === NO_ERROR) {
          window.alert("Changement d'avatar réussi!")
        } else {
          window.alert("La base de données est inacessible!")
        }
      })
    this.subscriptionUsername = this.accountService.getChangeUserNameResponse().subscribe((errorCode: string) => {
      this.errorCodeUsername = errorCode;
      if (errorCode === NO_ERROR) {
        window.alert("Changement du nom de l'utilisateur réussi!")
      } else if (errorCode === USERNAME_TAKEN) {
        window.alert("Le nom choisi n'est pas disponible!")
      } else {
        window.alert("La base de données est inacessible!")
      }
    })
    this.getUserName();
    this.accountProfile = this.accountService.getProfile();
    this.progressionBarValue = (this.accountProfile.levelInfo.xp / this.accountProfile.levelInfo.nextLevelXp) * 100
  }

  changeThemeTo(newTheme: string) {
    this.themeService.getAvailableThemes().forEach((theme: Theme) => {
      if (theme.name.toString() === newTheme) {
        this.themeService.setActiveTheme(theme);
        this.updateUserTheme(newTheme);
      }
    });
    //localStorage.setItem("currentTheme", newTheme);
  }

  setActive(event: Event) {
    let themes = document.getElementsByClassName("theme-button");
    for (let i = 0; i < themes.length; i++) {
      themes[i].className = themes[i].className.replace(" active", "");
    }
    (event.currentTarget! as HTMLTextAreaElement).className += " active";
  }

  goToFriends() {
    this.router.navigate(['/friends-page']);
  }

  updateUserTheme(theme: string) {
    this.accountService.changeTheme(theme);
  }

}
