import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileInfo } from '@app/classes/profileInfo';
import { AvatarPopUpComponent } from '@app/components/profil-pop-up/avatar-pop-up/avatar-pop-up.component';
import { NO_ERROR } from '@app/constants/error-codes';
import { AccountService } from '@app/services/account-service/account.service';
import { Subscription } from 'rxjs';
import { classic, Theme } from '@app/constants/themes';
import { ThemesService } from '@app/services/themes-service/themes-service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  accountProfile:ProfileInfo
  accountUsername:string;
  subscriptionChangeAvatar:Subscription;
  constructor(private accountService:AccountService,public dialogAvatar:MatDialog,private themeService: ThemesService) {
    this.subscriptionChangeAvatar = this.accountService.getAvatarChangeStatus()
    .subscribe((errorCode:string)=>{
      if (errorCode === NO_ERROR){
        window.alert("Changement d'avatar réussi!")
      } else{
        window.alert("La base de données est inacessible!")
      }
    })
    this.getUserName();
    this.accountProfile = this.accountService.getProfile();
   }
  
  openDialogChangeColor():void{
    const dialogReference = this.dialogAvatar.open(AvatarPopUpComponent, {
      width: '400px',
      height:'300px',
      data: {accountService:this.accountService}
    });

    dialogReference.afterClosed().subscribe(result => {
      if(result && result.color !== ""){
        this.accountProfile.avatar = result.color;
      }
    });
    
  }
  
  getUserName(){
    this.accountUsername = this.accountService.getUsername();
  }

  ngOnInit(): void {
    let current = localStorage.getItem("currentTheme");
    if (current) {
      this.changeThemeTo(current);
      document.getElementById(current)!.className += " active";
    }
    else {
      localStorage.setItem("currentTheme", classic.toString());
      document.getElementById('classic')!.className += " active";
    }
  } //ne fonctionne que sur profile page

  changeThemeTo(newTheme: string) {
    this.themeService.getAvailableThemes().forEach((theme: Theme) => {
      if (theme.name.toString() === newTheme) this.themeService.setActiveTheme(theme);
    });
    localStorage.setItem("currentTheme", newTheme);
  }

  setActive(event: Event) {
    let themes = document.getElementsByClassName("theme-button");
    for (let i = 0; i < themes.length; i++) {
      themes[i].className = themes[i].className.replace(" active", "");
    }
    (event.currentTarget! as HTMLTextAreaElement).className += " active";
  }
}
