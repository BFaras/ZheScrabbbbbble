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
    if (!this.letterChosen || this.letterChosen.length > 1 || !isNaN(Number(this.letterChosen)) || this.verifyItIsNotALetter()) {
      return true;
    }
    return false;
  }

  verifyItIsNotALetter() {
    if (this.letterChosen.charCodeAt(0) < 65 ||
      this.letterChosen.charCodeAt(0) > 90 && this.letterChosen.charCodeAt(0) < 97 ||
      this.letterChosen.charCodeAt(0) > 122)
      return true
    else {
      return false
    }

  }
  closeDialog() {
    this.dialogRef.close({ letter: this.letterChosen.toUpperCase() })
  }

}
