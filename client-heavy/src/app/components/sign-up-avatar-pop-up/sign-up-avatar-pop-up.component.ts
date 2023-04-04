import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountCreationService } from '@app/services/account-creation-service/account-creation.service';

@Component({
  selector: 'app-sign-up-avatar-pop-up',
  templateUrl: './sign-up-avatar-pop-up.component.html',
  styleUrls: ['./sign-up-avatar-pop-up.component.scss']
})
export class SignUpAvatarPopUpComponent implements OnInit {
  avatarChosen: string = "";
  allAvatars: string[] = ['Daria.PNG', 'Arnaud.PNG', 'Imane.PNG', 'Raphaël.PNG', 'Manuel.PNG', 'Mohamed.PNG', 'cow.png', 'mouse.png', 'giraffe.png',
    'shark.png', 'owl.png', 'monkey.png', 'robot.png', 'cat.png', 'dog.png', 'alien.png', 'fox.png', 'pig.png', 'panda.png',
    'bunny.png', 'rooster.png', 'unicorn.png', 'lion.png', 'skeleton.png', 'bear.png', 'tiger.png', 'koala.png', 'ghost.png'];
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
