import { Component, OnInit } from '@angular/core';
import { Account } from '@app/classes/account';
import { AccountAuthenticationService } from '@app/services/account-authentification-service/account-authentication.service';
import { Subscription } from 'rxjs';
import { VISIBILITY_CONSTANTS } from '@app/constants/visibility-constants';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login-area',
  templateUrl: './login-area.component.html',
  styleUrls: ['./login-area.component.scss']
})
export class LoginAreaComponent implements OnInit {
  userAccount: Account = {
    username : "",
    email : "",
    password : "",
  }
  subscription:Subscription
  hide:boolean = true;
  isConnected: boolean = false;

  constructor(private accountAuthenticationService:AccountAuthenticationService, private router:Router) {
    this.accountAuthenticationService.setUpSocket()
   }

  ngOnInit(): void {
  }

  changePasswordVisibility(): string{
    return this.hide ? VISIBILITY_CONSTANTS.passwordHidden : VISIBILITY_CONSTANTS.passwordShown  ;
    
  }

  changeIconVisibility(): string{
    return this.hide ? VISIBILITY_CONSTANTS.IconHiddenMode : VISIBILITY_CONSTANTS.IconShownMode;
  }

  loginToAccount(){
    this.accountAuthenticationService.LoginToAccount(this.userAccount);
    this.subscription = this.accountAuthenticationService.getStatusOfAuthentication().subscribe(
      (status: boolean) => this.showStatus(status) );
  }

  showStatus(status:boolean){
    if (status == true){
      console.log(status)
      this.router.navigate(['home']);
    }else{
      console.log(status)
      alert("Échec de l'authentification");
    }
  }

}
