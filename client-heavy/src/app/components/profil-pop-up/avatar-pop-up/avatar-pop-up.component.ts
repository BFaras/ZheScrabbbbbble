import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { COLORS_PROFILE } from '@app/constants/colors-profile';
import { AccountService } from '@app/services/account-service/account.service';
@Component({
  selector: 'app-avatar-pop-up',
  templateUrl: './avatar-pop-up.component.html',
  styleUrls: ['./avatar-pop-up.component.scss']
})
export class AvatarPopUpComponent implements OnInit {
  readonly colorsProfile = COLORS_PROFILE;
  colorChosen:string = "";
  constructor(private dialogRef: MatDialogRef<AvatarPopUpComponent>,@Inject(MAT_DIALOG_DATA) public account: {accountService: AccountService}) { }

  ngOnInit(): void {
  }

  changeColors(value:string){
    this.colorChosen = value;
    

  }
  closeDialog(){
    if (this.colorChosen !== ""){
      this.account.accountService.changeAvatar(this.colorChosen);
    }
    this.dialogRef.close({color:this.colorChosen})
  }
  

}
