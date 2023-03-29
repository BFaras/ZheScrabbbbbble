import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-blank-tile-pop-up',
  templateUrl: './blank-tile-pop-up.component.html',
  styleUrls: ['./blank-tile-pop-up.component.scss']
})
export class BlankTilePopUpComponent implements OnInit {
  letterChosen: string;
  constructor(private dialogRef: MatDialogRef<BlankTilePopUpComponent>) {}

  ngOnInit(): void {
  }
  checkEmptyInput() {
    if (!this.letterChosen || this.letterChosen.length > 1 || !isNaN(Number(this.letterChosen))) {
      return true;
    }
    return false;
  }
  closeDialog() {
    this.dialogRef.close({ letter: this.letterChosen.toUpperCase() })
  }

}
