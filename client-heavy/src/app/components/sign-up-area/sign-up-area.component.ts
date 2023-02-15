import { Component, OnInit } from '@angular/core';
import { Account } from '@app/classes/account';
import { AccountCreationService } from '@app/services/account-creation-service/account-creation.service';
import { VISIBILITY_CONSTANTS } from '@app/constants/visibility-constants';
import { Subscription } from 'rxjs';
import {  Router } from '@angular/router';
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
    securityQuestion : "",
    securityAnswer : ""
  }
  subscription:Subscription
  hide:boolean = true;
  isFormFinished: boolean = false;

  constructor(private accountCreationService:AccountCreationService,private router:Router) {
    this.accountCreationService.setUpSocket()
   }

  ngOnInit(): void {
  }
  
  changePasswordVisibility(): string{
    return this.hide ? VISIBILITY_CONSTANTS.passwordHidden : VISIBILITY_CONSTANTS.passwordShown;
    
  }

  changeIconVisibility(): string{
    return this.hide ? VISIBILITY_CONSTANTS.IconHiddenMode : VISIBILITY_CONSTANTS.IconShownMode;
  }

  verifyIfFirstPageFormFinished(): boolean{
    if (this.newAccount.username === "" || this.newAccount.password === "" || this.newAccount.email === ""){
      return true
    }
    else{
      return false
    }
  }

  verifyIfSecondPageFormFinished(): boolean{
    if (this.newAccount.securityQuestion === "" || this.newAccount.securityAnswer === ""){
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
