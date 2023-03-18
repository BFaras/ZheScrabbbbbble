import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Account } from '@app/classes/account';
import { VISIBILITY_CONSTANTS } from '@app/constants/visibility-constants';
import { AccountAuthenticationService } from '@app/services/account-authentification-service/account-authentication.service';
import { AccountService } from '@app/services/account-service/account.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-login-area',
  templateUrl: './login-area.component.html',
  styleUrls: ['./login-area.component.scss']
})
export class LoginAreaComponent implements OnInit {
  userAccount: Account = {
    username: "",
    email: "",
    password: "",
    securityQuestion: { question: "", answer: "" },
  }
  subscription: Subscription
  hide: boolean = true;
  isConnected: boolean = false;

  constructor(private accountAuthenticationService: AccountAuthenticationService, private router: Router, private account: AccountService) {
    this.accountAuthenticationService.setUpSocket()
  }

  ngOnInit(): void {
  }

  changePasswordVisibility(): string {
    return this.hide ? VISIBILITY_CONSTANTS.passwordHidden : VISIBILITY_CONSTANTS.passwordShown;

  }

  changeIconVisibility(): string {
    return this.hide ? VISIBILITY_CONSTANTS.IconHiddenMode : VISIBILITY_CONSTANTS.IconShownMode;
  }

  loginToAccount() {
    this.accountAuthenticationService.LoginToAccount(this.userAccount);
    this.subscription = this.accountAuthenticationService.getStatusOfAuthentication().subscribe(
      (status: boolean) => this.showStatus(status));
  }

  showStatus(status: boolean) {
    if (status == true) {
      this.account.setUsername(this.userAccount.username);
      this.router.navigate(['home']);
    } else {
      alert("Échec de l'authentification");
    }
  }

  moveToPassword() {
    this.router.navigate(['password-lost']);
  }


}
