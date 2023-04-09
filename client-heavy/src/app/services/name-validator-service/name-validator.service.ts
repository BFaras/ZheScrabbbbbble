import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export const NAME_DELAY = 1000;

@Injectable({
    providedIn: 'root',
})
export class NameValidatorService {
    guestPlayerNameIsValid: boolean = false;
    virtualPlayerNameList: string[] = ['Alex', 'Rebecca', 'Damien'];

    constructor(private snackBar: MatSnackBar) {

    }
    validateGuestPlayerName(hostPlayerName: string, guestPlayerName: string): boolean {
        if (guestPlayerName.trim() === '') {
            this.snackBar.open("Veuillez vous assurer que votre nom n'est pas vide.", "Fermer")
            return this.guestPlayerNameIsValid;
        }
        this.guestPlayerNameIsValid = this.namesNotEqual(hostPlayerName, guestPlayerName);
        if (!this.guestPlayerNameIsValid) this.snackBar.open("Échec de l'authentification", "Fermer");
        return this.guestPlayerNameIsValid;
    }

    namesNotEqual(hostPlayerName: string, guestPlayerName: string): boolean {
        return !(hostPlayerName === guestPlayerName);
    }

    checkIfNameEqualsVirtualPlayer(value: string) {
        return of(this.virtualPlayerNameList.some((a) => a === value)).pipe(delay(NAME_DELAY));
    }
}
