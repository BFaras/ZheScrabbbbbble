import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccountService } from '@app/services/account-service/account.service';
/**probleme espace a bouger apres dans profil-pop-up
 */
@Component({
  selector: 'app-change-name-pop-up',
  templateUrl: './change-name-pop-up.component.html',
  styleUrls: ['./change-name-pop-up.component.scss']
})
export class ChangeNamePopUpComponent implements OnInit {
  newUsername: string = "";
  constructor(private dialogRef: MatDialogRef<ChangeNamePopUpComponent>, @Inject(MAT_DIALOG_DATA) public account: { accountService: AccountService }) {}

  ngOnInit(): void {
  }

  closeDialog() {
    if (this.newUsername !== "") {
      this.account.accountService.changeUsername(this.newUsername);
      console.log("dans le if")
      console.log(this.newUsername)
    }
    console.log("outside le if")
    this.dialogRef.close({ name: this.newUsername })
    console.log(this.newUsername)

  }

}
