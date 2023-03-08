import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileInfo } from '@app/classes/profileInfo';
import { AvatarPopUpComponent } from '@app/components/profil-pop-up/avatar-pop-up/avatar-pop-up.component';
import { NO_ERROR } from '@app/constants/error-codes';
import { AccountService } from '@app/services/account-service/account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  accountProfile:ProfileInfo
  accountUsername:string;
  subscriptionChangeAvatar:Subscription;
  constructor(private accountService:AccountService,public dialogAvatar:MatDialog) {
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
  }

}
