import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccountCreationService } from '@app/services/account-creation-service/account-creation.service';

@Component({
  selector: 'app-sign-up-avatar-pop-up',
  templateUrl: './sign-up-avatar-pop-up.component.html',
  styleUrls: ['./sign-up-avatar-pop-up.component.scss']
})
export class SignUpAvatarPopUpComponent implements OnInit {
  avatarChosen: string = "";
  allAvatars: string[] = ["cat.jpg", 'dog.jpg', 'flower.jpg'];
  constructor(private dialogRef: MatDialogRef<SignUpAvatarPopUpComponent>, @Inject(MAT_DIALOG_DATA) public account: { accountService: AccountCreationService }) {
  }

  ngOnInit(): void {
  }

  changeAvatar(value: string) {
    console.log(value)
    this.avatarChosen = value;

  }
  closeDialog() {
    console.log(this.avatarChosen);
    this.dialogRef.close({ avatar: this.avatarChosen })
  }


}
