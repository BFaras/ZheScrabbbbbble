import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AccountService } from '../account-service/account.service';
import { SnackBarHandlerService } from '../snack-bar-handler.service';

export const NAME_DELAY = 1000;

@Injectable({
    providedIn: 'root',
})
export class NameValidatorService {
    guestPlayerNameIsValid: boolean = false;
    virtualPlayerNameList: string[] = ['Alex', 'Rebecca', 'Damien'];

    constructor(private snackBarHandler: SnackBarHandlerService, private account: AccountService) {

    }
    validateGuestPlayerName(hostPlayerName: string, guestPlayerName: string): boolean {
        this.account.setMessages();
        if (guestPlayerName.trim() === '') {
            this.snackBarHandler.makeAnAlert(this.account.messageNameEmpty, this.account.closeMessage);
            return this.guestPlayerNameIsValid;
        }
        this.guestPlayerNameIsValid = this.namesNotEqual(hostPlayerName, guestPlayerName);
        if (!this.guestPlayerNameIsValid) this.snackBarHandler.makeAnAlert(this.account.messageAuth, this.account.closeMessage);
        return this.guestPlayerNameIsValid;
    }

    namesNotEqual(hostPlayerName: string, guestPlayerName: string): boolean {
        return !(hostPlayerName === guestPlayerName);
    }

    checkIfNameEqualsVirtualPlayer(value: string) {
        return of(this.virtualPlayerNameList.some((a) => a === value)).pipe(delay(NAME_DELAY));
    }
}
