import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountAuthenticationService } from '@app/services/account-authentification-service/account-authentication.service';
import { AccountService } from '@app/services/account-service/account.service';
import { SnackBarHandlerService } from '@app/services/snack-bar-handler.service';
import { Subscription } from 'rxjs/internal/Subscription';


@Component({
  selector: 'app-password-lost-area',
  templateUrl: './password-lost-area.component.html',
  styleUrls: ['./password-lost-area.component.scss']
})
export class PasswordLostAreaComponent implements OnInit, OnDestroy {
  username: string;
  newPassword: string;
  newPasswordConfirmed: string;
  isQuestionAnswered: boolean = false;
  questionReset: string;
  answerReset: string;
  subscriptionModifyPassword: Subscription;
  subscriptionGetQuestion: Subscription;

  constructor(private snackBarHandler: SnackBarHandlerService, private router: Router, private accountAuthenticationService: AccountAuthenticationService, private account: AccountService) {
    this.accountAuthenticationService.setUpSocket();
  }

  ngOnDestroy(): void {
    this.snackBarHandler.closeAlert()
  }

  ngOnInit(): void {
  }

  goBackToLogin() {
    this.router.navigate(['login']);
  }

  generateQuestion() {

    this.subscriptionGetQuestion = this.accountAuthenticationService.getUserQuestion(this.username).subscribe(
      (question: string) => {
        this.account.setMessages();
        if (question) {
          this.isQuestionAnswered = true;
          this.questionReset = question;
        } else {
          this.isQuestionAnswered = false;
          this.questionReset = "";
          this.snackBarHandler.makeAnAlert(this.account.messageUnvalid, this.account.closeMessage);
        }
      });
  }

  changePassword() {

    const NO_ERROR = "0";
    const DATABASE_UNAVAILABLE = "5";
    this.subscriptionModifyPassword = this.accountAuthenticationService.modifyPassword(this.username, this.newPassword, this.answerReset).subscribe(
      (errorCode: string) => {
        this.account.setMessages();
        if (errorCode === NO_ERROR) {
          this.snackBarHandler.makeAnAlert(this.account.messagePW, this.account.closeMessage);
          this.router.navigate(['login']);
        }
        else if (errorCode === DATABASE_UNAVAILABLE) {
          this.snackBarHandler.makeAnAlert(this.account.messageBD, this.account.closeMessage);
        }
        else {
          this.snackBarHandler.makeAnAlert(this.account.messageQ, this.account.closeMessage);

        }
      }
    );
  }

  goToIsQuestionAnswered(): void {
    this.isQuestionAnswered = !this.isQuestionAnswered
  }

  goToLogIn(): void {
    this.router.navigate(['/login']);
  }

}
