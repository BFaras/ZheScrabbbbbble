import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccountService } from '@app/services/account-service/account.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-avatar-pop-up',
  templateUrl: './avatar-pop-up.component.html',
  styleUrls: ['./avatar-pop-up.component.scss']
})
export class AvatarPopUpComponent implements OnInit, OnDestroy {
  colorChosen: string = "";
  allAvatars: string[] = ["cat.jpg", 'dog.jpg', 'flower.jpg'];
  subscription: Subscription;
  constructor(private dialogRef: MatDialogRef<AvatarPopUpComponent>, @Inject(MAT_DIALOG_DATA) public account: { accountService: AccountService }) {

  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

  changeAvatar(value: string) {
    this.colorChosen = value;


  }
  closeDialog() {
    if (this.colorChosen !== "") {
      this.account.accountService.changeAvatar(this.colorChosen);
    }
    this.dialogRef.close({ avatar: this.colorChosen })
  }


}
