import {
    CHAR_EMAIL_MUST_CONTAIN,
    MAX_ASCII_SYMBOL,
    MIN_ASCII_SYMBOL,
    MIN_USERNAME_LENGTH,
    NB_OF_CHARS_TO_ADVANCE,
    NB_OF_RANDOM_CHARS_TO_ADD,
    NEGATIVE_MULTIPLIER,
    POSITIVE_MULTIPLIER
} from '@app/constants/authentification-constants';
import { AccountCreationState } from '@app/interfaces/account-creation-state';
import { DatabaseService } from './database.service';

export class AuthentificationService {
    constructor(private dbService: DatabaseService) {}

    authentifyUser(username: string, password: string): boolean {
        const encryptedPasswordFromDB: string = '';
        const decryptedPasswordFromDB: string = this.decryptPassword(encryptedPasswordFromDB);
        return decryptedPasswordFromDB == password;
    }

    async createAccount(username: string, password: string, email: string, userAvatar: string): Promise<AccountCreationState> {
        const accountCreationState: AccountCreationState = await this.verifyAccountRequirements(username, password, email);
        if (accountCreationState.accountCreationSuccess) {
            const encryptedPassword: string = this.encryptPassword(password);
            accountCreationState.accountCreationSuccess = await this.dbService.addUserAccount(username, encryptedPassword, email, userAvatar);
        }
        return Promise.resolve(accountCreationState);
    }

    private async verifyAccountRequirements(username: string, password: string, email: string): Promise<AccountCreationState> {
        const accountCreationState: AccountCreationState = {
            isUsernameValid: true,
            isEmailValid: true,
            isPasswordValid: true,
            isUsernameTaken: false,
            accountCreationSuccess: true,
        };

        accountCreationState.isUsernameValid = username.length >= MIN_USERNAME_LENGTH;
        accountCreationState.isEmailValid = email.includes(CHAR_EMAIL_MUST_CONTAIN);
        accountCreationState.isPasswordValid = password.length >= MIN_USERNAME_LENGTH;
        accountCreationState.isUsernameTaken = await this.dbService.isUsernameTaken(username);
        accountCreationState.accountCreationSuccess =
            accountCreationState.isUsernameValid && accountCreationState.isEmailValid && accountCreationState.isPasswordValid && accountCreationState.isUsernameTaken;

        return Promise.resolve(accountCreationState);
    }

    private encryptPassword(decryptedPassword: string): string {
        let encryptedPassword: string = '';
        for (let i = 0; i < decryptedPassword.length; i++) {
            const multiplier = i % 2 == 0 ? NEGATIVE_MULTIPLIER : POSITIVE_MULTIPLIER;
            const newCharAtPositionCode: number = decryptedPassword.charCodeAt(i) + i * multiplier * NB_OF_CHARS_TO_ADVANCE;
            encryptedPassword += String.fromCharCode(newCharAtPositionCode);
            encryptedPassword += this.generateRandomString(i + NB_OF_RANDOM_CHARS_TO_ADD);
        }

        return encryptedPassword;
    }

    private decryptPassword(encryptedPassword: string): string {
        let decryptedPassword: string = '';
        let letterCounter = 0;
        for (let i = 0; i < encryptedPassword.length; i += letterCounter + NB_OF_RANDOM_CHARS_TO_ADD) {
            const multiplier = letterCounter % 2 == 0 ? POSITIVE_MULTIPLIER : NEGATIVE_MULTIPLIER;
            const charAtPositionCode: number = encryptedPassword.charCodeAt(i) + letterCounter * multiplier * NB_OF_CHARS_TO_ADVANCE;
            decryptedPassword += String.fromCharCode(charAtPositionCode);
            letterCounter++;
        }

        return decryptedPassword;
    }

    private generateRandomString(stringLength: number): string {
        let generatedString = '';

        for (let i = 0; i < stringLength; i++) {
            const randomCharCode = Math.floor(Math.random() * (MAX_ASCII_SYMBOL + 1)) + MIN_ASCII_SYMBOL;
            generatedString += String.fromCharCode(randomCharCode);
        }

        return generatedString;
    }
}
