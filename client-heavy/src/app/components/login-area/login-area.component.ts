import { Component, OnInit } from '@angular/core';
import { Account } from '@app/classes/account';
import { AccountAuthenticationService } from '@app/services/account-authentification-service/account-authentication.service';

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
  hide:boolean = true;

  constructor(private accountAuthentificationService:AccountAuthenticationService) { }

  ngOnInit(): void {
  }

  changePasswordVisibility(): string{
    return this.hide ? 'password' : 'text';
    
  }

  changeIconVisibility(): string{
    return this.hide ? 'visibility_off' : 'visibility';
  }

  loginToAccount(){
    this.accountAuthentificationService.LoginToAccount(this.userAccount)
  }

}
