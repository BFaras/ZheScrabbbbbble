import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountCreationService } from '@app/services/account-creation-service/account-creation.service';
import { AccountService } from '@app/services/account-service/account.service';

@Component({
  selector: 'app-sign-up-avatar-pop-up',
  templateUrl: './sign-up-avatar-pop-up.component.html',
  styleUrls: ['./sign-up-avatar-pop-up.component.scss']
})
export class SignUpAvatarPopUpComponent {
  avatarChosen: string = "";
  allAvatars: string[] = [];
  constructor(private dialogRef: MatDialogRef<SignUpAvatarPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public account: { accountService: AccountCreationService },
    private accountService: AccountService) {
    this.allAvatars = this.accountService.getDefaultAvatars();
  }

  changeAvatar(event: Event, value: string) {
    this.setActive(event);
    console.log(value)
    this.avatarChosen = value;
  }

  closeDialog() {
    console.log(this.avatarChosen);
    this.dialogRef.close({ avatar: this.avatarChosen })
  }

  setActive(event: Event) {
    let themes = document.getElementsByClassName("avatar");
    for (let i = 0; i < themes.length; i++) {
      themes[i].className = themes[i].className.replace(" active", "");
    }
    (event.currentTarget! as HTMLTextAreaElement).className += " active";
  }


}
