import {
    CREATION_SUCCESS,
    DATABASE_UNAVAILABLE,
    EMAIL_INVALID,
    PASSWORD_INVALID,
    USERNAME_INVALID,
    USERNAME_TAKEN
} from '@app/constants/account-error-code-constants';
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
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';
import { OnlineUsersService } from './online-users.service';

@Service()
export class AuthentificationService {
    private readonly dbService: DatabaseService;
    private readonly onlineUsersService: OnlineUsersService;
    constructor() {
        this.dbService = Container.get(DatabaseService);
        this.onlineUsersService = Container.get(OnlineUsersService);
    }

    async authentifyUser(username: string, password: string): Promise<boolean> {
        let isConnectionSuccessful = false;
        if (!this.onlineUsersService.isUserOnline(username)) {
            const decryptedPasswordFromDB: string = this.decryptPassword(await this.dbService.getUserEncryptedPassword(username));
            isConnectionSuccessful = decryptedPasswordFromDB.length > 0 && decryptedPasswordFromDB === password;
        }

        if (isConnectionSuccessful) {
            this.onlineUsersService.addOnlineUser(username);
        }

        return isConnectionSuccessful;
    }

    async createAccount(username: string, password: string, email: string, userAvatar: string): Promise<string> {
        let accountCreationState: string = await this.verifyAccountRequirements(username, password, email);
        if (accountCreationState === CREATION_SUCCESS) {
            const encryptedPassword: string = this.encryptPassword(password);
            if (await this.dbService.addUserAccount(username, encryptedPassword, email, userAvatar)) {
                accountCreationState = DATABASE_UNAVAILABLE;
            }
        }

        if (accountCreationState === CREATION_SUCCESS) {
            this.onlineUsersService.addOnlineUser(username);
        }

        return Promise.resolve(accountCreationState);
    }

    private async verifyAccountRequirements(username: string, password: string, email: string): Promise<string> {
        let errorCode = CREATION_SUCCESS;
        const accountCreationState: AccountCreationState = {
            isUsernameValid: username.length >= MIN_USERNAME_LENGTH,
            isEmailValid: email.includes(CHAR_EMAIL_MUST_CONTAIN),
            isPasswordValid: password.length >= MIN_USERNAME_LENGTH,
            isUsernameFree: await this.dbService.isUsernameFree(username),
        };

        if (!accountCreationState.isUsernameValid) {
            errorCode = USERNAME_INVALID;
        } else if (!accountCreationState.isEmailValid) {
            errorCode = EMAIL_INVALID;
        } else if (!accountCreationState.isPasswordValid) {
            errorCode = PASSWORD_INVALID;
        } else if (!accountCreationState.isUsernameFree) {
            errorCode = USERNAME_TAKEN;
        }

        return Promise.resolve(errorCode);
    }

    private encryptPassword(decryptedPassword: string): string {
        let encryptedPassword = '';
        for (let i = 0; i < decryptedPassword.length; i++) {
            const multiplier = i % 2 === 0 ? NEGATIVE_MULTIPLIER : POSITIVE_MULTIPLIER;
            const newCharAtPositionCode: number = decryptedPassword.charCodeAt(i) + i * multiplier * NB_OF_CHARS_TO_ADVANCE;
            encryptedPassword += String.fromCharCode(newCharAtPositionCode);
            encryptedPassword += this.generateRandomString(i + NB_OF_RANDOM_CHARS_TO_ADD);
        }

        return encryptedPassword;
    }

    private decryptPassword(encryptedPassword: string): string {
        let decryptedPassword = '';
        let letterCounter = 0;
        for (let i = 0; i < encryptedPassword.length; i += letterCounter + NB_OF_RANDOM_CHARS_TO_ADD) {
            const multiplier = letterCounter % 2 === 0 ? POSITIVE_MULTIPLIER : NEGATIVE_MULTIPLIER;
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
