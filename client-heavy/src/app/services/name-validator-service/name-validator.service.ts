import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export const NAME_DELAY = 1000;

@Injectable({
    providedIn: 'root',
})
export class NameValidatorService {
    guestPlayerNameIsValid: boolean = false;
    virtualPlayerNameList: string[] = ['Alex', 'Rebecca', 'Damien'];

    validateGuestPlayerName(hostPlayerName: string, guestPlayerName: string): boolean {
        if (guestPlayerName.trim() === '') {
            alert("Veuillez vous assurer que votre nom n'est pas vide.");
            return this.guestPlayerNameIsValid;
        }
        this.guestPlayerNameIsValid = this.namesNotEqual(hostPlayerName, guestPlayerName);
        if (!this.guestPlayerNameIsValid) alert("Veuillez vous assurer que votre nom soit différent de celui de l'hôte.");
        return this.guestPlayerNameIsValid;
    }

    namesNotEqual(hostPlayerName: string, guestPlayerName: string): boolean {
        return !(hostPlayerName === guestPlayerName);
    }

    checkIfNameEqualsVirtualPlayer(value: string) {
        return of(this.virtualPlayerNameList.some((a) => a === value)).pipe(delay(NAME_DELAY));
    }
}
