import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { connectionHistory } from '@app/classes/connection-history';
import { ProfileInfo } from '@app/classes/profileInfo';
import { ChangeNamePopUpComponent } from '@app/components/change-name-pop-up/change-name-pop-up.component';
import { AvatarPopUpComponent } from '@app/components/profil-pop-up/avatar-pop-up/avatar-pop-up.component';
import { NO_ERROR, USERNAME_TAKEN } from '@app/constants/error-codes';
import { Theme } from '@app/constants/themes';
import { AccountService } from '@app/services/account-service/account.service';
import { FriendsService } from '@app/services/friends.service';
import { ThemesService } from '@app/services/themes-service/themes-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  //true: profile
  //false: friend
  profileMode: boolean;
  isBuilt: boolean = false;
  accountProfile: ProfileInfo;
  accountUsername: string;
  errorCodeUsername: string
  subscriptionChangeAvatar: Subscription;
  subscriptionUsername: Subscription;
  progressionBarValue: number
  avatarCircle: string;
  medals: string[] = ['1st-place.png', '2nd-place.png', '3rd-place.png'];
  connectionHistory: connectionHistory = {
    connections: [],
    disconnections: [],
  };

  constructor(private accountService: AccountService,
    public dialog: MatDialog,
    private themeService: ThemesService,
    private router: Router,
    private friends: FriendsService,
    private snackBar: MatSnackBar) {
    this.profileMode = this.friends.getMode();
  }

  ngOnDestroy() {
    this.subscriptionChangeAvatar.unsubscribe();
    this.subscriptionUsername.unsubscribe()
  }

  openDialogChangeName(): void {
    const dialogRef = this.dialog.open(ChangeNamePopUpComponent, {
      width: '450px',
      height: '230px',
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
        ('test3');
        this.accountProfile.avatar = result.avatar;
        this.avatarCircle = "assets/avatar/" + result.avatar;
      }
    });

  }

  getUserName() {
    if (this.profileMode) this.accountUsername = this.accountService.getUsername();
    else this.accountUsername = this.friends.getUsername();
  }

  ngOnInit(): void {
    this.subscriptionChangeAvatar = this.accountService.getAvatarChangeStatus()
      .subscribe((errorCode: string) => {
        this.accountService.setMessages();
        if (errorCode === NO_ERROR) {
          this.snackBar.open(this.accountService.messageAvatar, this.accountService.closeMessage)
        } else {
          this.snackBar.open(this.accountService.messageBD, this.accountService.closeMessage)
        }
      })
    this.subscriptionUsername = this.accountService.getChangeUserNameResponse().subscribe((errorCode: string) => {
      this.errorCodeUsername = errorCode;
      this.accountService.setMessages();
      if (errorCode === NO_ERROR) {
        this.snackBar.open(this.accountService.messageName, this.accountService.closeMessage)
      } else if (errorCode === USERNAME_TAKEN) {
        this.snackBar.open(this.accountService.messageNA, this.accountService.closeMessage)
      } else {
        this.snackBar.open(this.accountService.messageBD, this.accountService.closeMessage)
      }
    })

    this.selectProfile();
    this.isBuilt = true;
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
    let themes = document.getElementsByClassName("theme");
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

  selectProfile() {
    if (this.isBuilt) this.profileMode = true;
    this.getUserName();
    if (this.profileMode) this.accountProfile = this.accountService.getProfile();
    else this.accountProfile = this.friends.getProfile();
    this.avatarCircle = "assets/avatar/" + this.accountProfile.avatar;
    this.progressionBarValue = (this.accountProfile.levelInfo.xp / this.accountProfile.levelInfo.nextLevelXp) * 100
    console.log(this.accountProfile)
  }

}
