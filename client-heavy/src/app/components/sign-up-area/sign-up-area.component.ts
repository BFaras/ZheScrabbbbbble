import { Component, OnInit } from '@angular/core';
import { Account } from '@app/classes/account';
import { AccountCreationService } from '@app/services/account-creation-service/account-creation.service';
import { VISIBILITY_CONSTANTS } from '@app/constants/visibility-constants';
import { Subscription } from 'rxjs';
import {  Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SignUpAvatarPopUpComponent } from '../sign-up-avatar-pop-up/sign-up-avatar-pop-up.component';

@Component({
  selector: 'app-sign-up-area',
  templateUrl: './sign-up-area.component.html',
  styleUrls: ['./sign-up-area.component.scss']
})
export class SignUpAreaComponent implements OnInit {
  newAccount: Account = {
    username : "",
    email : "",
    password : "",
    avatar:"",
    securityQuestion: {question: "" , answer : ""},
  }
  subscription:Subscription
  hide:boolean = true;
  isFormFinished: boolean = false;
  avatarSrc:string;

  constructor(private accountCreationService:AccountCreationService, public dialogAvatar: MatDialog,private router:Router) {
    this.accountCreationService.setUpSocket()
   }

  ngOnInit(): void {
  }

  openDialogChooseAvatar(): void {
    const dialogReference = this.dialogAvatar.open(SignUpAvatarPopUpComponent, {
      width: '900px',
      height: '600px',
      data: { accountService: this.accountCreationService }
    });
    dialogReference.afterClosed().subscribe(result => {
      if (result.avatar) {
        console.log(result.avatar)
        this.newAccount.avatar = result.avatar;
      }
    });

  }
  
  changePasswordVisibility(): string{
    return this.hide ? VISIBILITY_CONSTANTS.passwordHidden : VISIBILITY_CONSTANTS.passwordShown;
    
  }

  changeIconVisibility(): string{
    return this.hide ? VISIBILITY_CONSTANTS.IconHiddenMode : VISIBILITY_CONSTANTS.IconShownMode;
  }

  verifyIfFirstPageFormFinished(): boolean{
    if (this.newAccount.username === "" || this.newAccount.password === "" || this.newAccount.email === "" || this.newAccount.avatar === ""){
      return true
    }
    else{
      return false
    }
  }

  verifyIfSecondPageFormFinished(): boolean{
    if (this.newAccount.securityQuestion.question === "" || this.newAccount.securityQuestion.answer === ""){
      return true
    }
    else{
      return false
    }
  }

  createNewAccount():void{
    this.accountCreationService.sendNewAccountInformation(this.newAccount)
    this.subscription = this.accountCreationService.getStatusOfAccountCreation().subscribe(
      (status: boolean) => this.showStatus(status) 
    )
  }

  showStatus(status:boolean){
    if (status == true){
      this.router.navigate(['home'])
    }else{
      alert('Échec de la Création de compte')
    }
  }

  goToCreateQuestion():void{
    this.isFormFinished = !this.isFormFinished
  }


}
