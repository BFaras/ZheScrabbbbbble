import { Component, OnInit } from '@angular/core';
import { Account } from '@app/classes/account';
import { AccountCreationService } from '@app/services/account-creation-service/account-creation.service';

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
  hide:boolean = true;

  constructor(private accountCreationService:AccountCreationService) { }

  ngOnInit(): void {
  }
  
  changePasswordVisibility(): string{
    return this.hide ? 'password' : 'text';
    
  }

  changeIconVisibility(): string{
    return this.hide ? 'visibility_off' : 'visibility';
  }

  createNewAccount():void{
    this.accountCreationService.sendNewAccountInformation(this.newAccount)
  }


}
