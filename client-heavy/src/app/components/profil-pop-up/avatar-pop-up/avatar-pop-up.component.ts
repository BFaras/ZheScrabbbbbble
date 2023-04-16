import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '@app/services/account-service/account.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-avatar-pop-up',
  templateUrl: './avatar-pop-up.component.html',
  styleUrls: ['./avatar-pop-up.component.scss']
})
export class AvatarPopUpComponent {
  colorChosen: string = "";
  allAvatars: string[] = [];
  lockedAvatars: string[] = [];
  subscription: Subscription;
  constructor(private dialogRef: MatDialogRef<AvatarPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public account: { accountService: AccountService },
    private accountService: AccountService) {
    this.accountService.updateAvatars();
    this.allAvatars = this.accountService.getAvatars();
    console.log(this.allAvatars);
    this.lockedAvatars = this.accountService.getLockedAvatars();
  }

  changeAvatar(event: Event, value: string) {
    this.colorChosen = value;
    this.setActive(event);
  }

  isLocked(avatar: string) {
    return this.lockedAvatars.includes(avatar);
  }

  closeDialog() {
    if (this.colorChosen !== "") {
      this.account.accountService.changeAvatar(this.colorChosen);
    }
    this.dialogRef.close({ avatar: this.colorChosen })
  }

  setActive(event: Event) {
    let themes = document.getElementsByClassName("avatar");
    for (let i = 0; i < themes.length; i++) {
      themes[i].className = themes[i].className.replace(" active", "");
    }
    (event.currentTarget! as HTMLTextAreaElement).className += " active";
  }


}
