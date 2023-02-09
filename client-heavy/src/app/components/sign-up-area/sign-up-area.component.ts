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
  }
  isAccountCreated:boolean = false;
  subscription:Subscription
  hide:boolean = true;

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


  


}
