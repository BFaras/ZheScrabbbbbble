import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confrim-pop-up',
  templateUrl: './confrim-pop-up.component.html',
  styleUrls: ['./confrim-pop-up.component.scss']
})
export class ConfrimPopUpComponent implements OnInit {
  alertDisplay: string
  constructor(private dialogRef: MatDialogRef<ConfrimPopUpComponent>, @Inject(MAT_DIALOG_DATA) public message: any) {

    this.alertDisplay = message.notification;
  }

  ngOnInit(): void {
  }

  acceptedCloseDialog() {
    this.dialogRef.close({ status: true })

  }

  refusedCloseDialog() {
    this.dialogRef.close({ status: false })

  }
}
