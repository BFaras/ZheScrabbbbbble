import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Account } from '@app/classes/account';
import { VISIBILITY_CONSTANTS } from '@app/constants/visibility-constants';
import { AccountAuthenticationService } from '@app/services/account-authentification-service/account-authentication.service';
import { AccountService } from '@app/services/account-service/account.service';
import { SnackBarHandlerService } from '@app/services/snack-bar-handler.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-area',
  templateUrl: './login-area.component.html',
  styleUrls: ['./login-area.component.scss']
})
export class LoginAreaComponent implements OnDestroy {
  userAccount: Account = {
    username: "",
    email: "",
    password: "",
    avatar: "",
    securityQuestion: { question: "", answer: "" },
  }
  subscription: Subscription;
  hide: boolean = true;
  isConnected: boolean = false;

  constructor(private accountAuthenticationService: AccountAuthenticationService,
    private router: Router, private account: AccountService,
    private snackBarHandler: SnackBarHandlerService) {
    this.accountAuthenticationService.setUpSocket();
    this.subscription = this.accountAuthenticationService.getStatusOfAuthentication().subscribe((status: boolean) => {
      this.showStatus(status);
    });
  }
  ngOnDestroy(): void {
    this.snackBarHandler.closeAlert()
  }

  changePasswordVisibility(): string {
    return this.hide ? VISIBILITY_CONSTANTS.passwordHidden : VISIBILITY_CONSTANTS.passwordShown;

  }

  changeIconVisibility(): string {
    return this.hide ? VISIBILITY_CONSTANTS.IconHiddenMode : VISIBILITY_CONSTANTS.IconShownMode;
  }

  loginToAccount() {
    this.accountAuthenticationService.LoginToAccount(this.userAccount);
  }

  @HostListener('window:keypress', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      this.loginToAccount()
    }
  }


  showStatus(status: boolean) {
    if (status == true) {
      this.account.setUsername(this.userAccount.username);
      this.router.navigate(['/home']);
    } else {
      this.account.setMessages();
      this.snackBarHandler.makeAnAlert(this.account.messageAuth, this.account.closeMessage);
    }
  }

  moveToPassword() {
    this.router.navigate(['password-lost']);
  }
}
