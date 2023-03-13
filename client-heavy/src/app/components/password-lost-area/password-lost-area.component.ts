import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountAuthenticationService } from '@app/services/account-authentification-service/account-authentication.service';
import { Subscription } from 'rxjs/internal/Subscription';


@Component({
  selector: 'app-password-lost-area',
  templateUrl: './password-lost-area.component.html',
  styleUrls: ['./password-lost-area.component.scss']
})
export class PasswordLostAreaComponent implements OnInit {
  username:string;
  newPassword:string ;
  newPasswordConfirmed:string;
  isQuestionAnswered:boolean = false;
  questionReset:string;
  answerReset:string;
  subscriptionModifyPassword: Subscription;
  subscriptionGetQuestion: Subscription;
  constructor(private router:Router, private accountAuthenticationService:AccountAuthenticationService) {
    this.accountAuthenticationService.setUpSocket()
  }

  ngOnInit(): void {
  }
  
  goBackToLogin(){
    this.router.navigate(['login']);
  }

  generateQuestion(){

    this.subscriptionGetQuestion =  this.accountAuthenticationService.getUserQuestion(this.username).subscribe(
      (question: string) => {
        if (question){
          this.isQuestionAnswered = true;
          this.questionReset = question;
        }else{
          this.isQuestionAnswered = false;
          this.questionReset = "";
          window.alert('Veuillez choisir un nom valide'); 
        }
        } );
  }

  ngOnDestroy() {
    this.subscriptionModifyPassword.unsubscribe();
    this.subscriptionGetQuestion.unsubscribe();
}
  changePassword(){
    this.subscriptionModifyPassword = this.accountAuthenticationService.modifyPassword(this.username,this.newPassword,this.answerReset).subscribe(
      (isThereError:string)=>{
        if (isThereError){
          //aleret
          window.alert('Veuillez entrer la bonne réponse à la question'); 
        }
        else{
          window.alert('Votre mot de passe a été modifié'); 
          this.router.navigate(['login']);
        }
      }
    );
    
  }



}
