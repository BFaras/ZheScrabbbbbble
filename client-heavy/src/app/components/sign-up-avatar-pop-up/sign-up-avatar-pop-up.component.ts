import { Component, OnInit,Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccountCreationService } from '@app/services/account-creation-service/account-creation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-up-avatar-pop-up',
  templateUrl: './sign-up-avatar-pop-up.component.html',
  styleUrls: ['./sign-up-avatar-pop-up.component.scss']
})
export class SignUpAvatarPopUpComponent implements OnInit {
  avatarChosen:string = "";
  allAvatars:string[];
  subscription:Subscription;
  constructor(private dialogRef: MatDialogRef<SignUpAvatarPopUpComponent>,@Inject(MAT_DIALOG_DATA) public account: {accountService: AccountCreationService}) {
    this.subscription = this.account.accountService.getAllAvatarsResponse().subscribe((allAvatars) =>{
      this.allAvatars = allAvatars;
    })

    this.account.accountService.getAllAvatars();
   }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
  }

  changeAvatar(value:string){
    this.avatarChosen = value;

  }
  closeDialog(){
    this.dialogRef.close({avatar:this.avatarChosen})
  }
  

}
