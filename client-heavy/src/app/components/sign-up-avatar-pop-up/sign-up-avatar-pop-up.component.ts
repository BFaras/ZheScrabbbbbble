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
  allAvatars: string[] = ['daria.PNG', 'arnaud.PNG', 'imane.PNG', 'raphael.PNG', 'manuel.PNG', 'mohamed.PNG', 'cow.png', 'mouse.png', 'giraffe.png',
    'shark.png', 'owl.png', 'monkey.png', 'robot.png', 'cat.png', 'dog.png', 'alien.png', 'fox.png', 'pig.png', 'panda.png',
    'bunny.png', 'rooster.png', 'unicorn.png', 'lion.png', 'skeleton.png', 'bear.png', 'tiger.png', 'koala.png', 'ghost.png'];
  constructor(private dialogRef: MatDialogRef<SignUpAvatarPopUpComponent>, @Inject(MAT_DIALOG_DATA) public account: { accountService: AccountCreationService }) {
  }

  ngOnInit(): void {
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
