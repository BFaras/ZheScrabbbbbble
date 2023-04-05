import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '@app/services/account-service/account.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-avatar-pop-up',
  templateUrl: './avatar-pop-up.component.html',
  styleUrls: ['./avatar-pop-up.component.scss']
})
export class AvatarPopUpComponent implements OnInit, OnDestroy {
  colorChosen: string = "";
  allAvatars: string[] = ['Daria.PNG', 'Arnaud.PNG', 'Imane.PNG', 'Raphael.PNG', 'Manuel.PNG', 'Mohamed.PNG', 'cow.png', 'mouse.png', 'giraffe.png',
    'shark.png', 'owl.png', 'monkey.png', 'robot.png', 'cat.png', 'dog.png', 'alien.png', 'fox.png', 'pig.png', 'panda.png',
    'bunny.png', 'rooster.png', 'unicorn.png', 'lion.png', 'skeleton.png', 'bear.png', 'tiger.png', 'koala.png', 'ghost.png'];
  subscription: Subscription;
  constructor(private dialogRef: MatDialogRef<AvatarPopUpComponent>, @Inject(MAT_DIALOG_DATA) public account: { accountService: AccountService }) {

  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

  changeAvatar(event: Event, value: string) {
    this.colorChosen = value;
    this.setActive(event);

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
