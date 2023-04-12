import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  makeAnAlert(message: string, closeCommand: string) {
    this.snackBar.open(message, closeCommand, {
      duration: 4000,
      panelClass: 'snack-bar'
    })
  }

  closeAlert() {
    this.snackBar.dismiss();
  }
}
