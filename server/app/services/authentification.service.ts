import {
    CHAR_EMAIL_MUST_CONTAIN,
    MAX_ASCII_SYMBOL,
    MIN_ASCII_SYMBOL,
    MIN_USERNAME_LENGTH,
    NB_OF_CHARS_TO_ADVANCE,
    NB_OF_RANDOM_CHARS_TO_ADD,
    NEGATIVE_MULTIPLIER,
    POSITIVE_MULTIPLIER,
    VIRTUAL_PLAYER_NAME
} from '@app/constants/authentification-constants';
import {
    DATABASE_UNAVAILABLE,
    EMAIL_INVALID,
    NO_ERROR,
    PASSWORD_INVALID,
    USERNAME_INVALID,
    USERNAME_TAKEN
} from '@app/constants/error-code-constants';
import { AccountCreationState } from '@app/interfaces/account-creation-state';
import { Question } from '@app/interfaces/question';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';
import { ProfileService } from './profile.service';
import { UsersStatusService } from './users-status.service';

@Service()
export class AuthentificationService {
    private readonly dbService: DatabaseService;
    private readonly usersStatusService: UsersStatusService;
    private readonly profileService: ProfileService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
        this.usersStatusService = Container.get(UsersStatusService);
        this.profileService = Container.get(ProfileService);
    }

    async authentifyUser(username: string, password: string): Promise<boolean> {
        const userId = await this.dbService.getUserId(username);
        if (this.usersStatusService.isUserOnline(userId)) {
            console.log(new Date().toLocaleTimeString() + ' | User is already connected on another device');
            return false;
        }
        const decryptedPasswordFromDB: string = this.decryptPassword(await this.dbService.getUserEncryptedPassword(username));
        if (decryptedPasswordFromDB.length > 0 && decryptedPasswordFromDB === password) {
            return true;
        }
        console.log(new Date().toLocaleTimeString() + ' | Incorrect password, login failed');
        return false;
    }

    async createAccount(username: string, password: string, email: string, userAvatar: string, securityQuestion: Question): Promise<string> {
        let accountCreationState: string = await this.verifyAccountRequirements(username, password, email);
        let userId = '';
        if (accountCreationState === NO_ERROR) {
            const encryptedPassword: string = this.encryptPassword(password);
            if (!(await this.dbService.addUserAccount(username, encryptedPassword, email, securityQuestion))) {
                accountCreationState = DATABASE_UNAVAILABLE;
            } else {
                userId = await this.dbService.getUserId(username);
                await this.profileService.createNewProfile(userId, userAvatar);
                await this.dbService.addFriendDoc(userId);
            }
        }

        return accountCreationState;
    }

    // To test in the future
    async getUserSecurityQuestion(username: string) {
        return await this.dbService.getUserSecurityQuestion(username);
    }

    async isSecurityQuestionAnswerRight(username: string, answerToQuestion: string): Promise<boolean> {
        const realAnswer = await this.dbService.getSecurityQuestionAsnwer(username);
        return answerToQuestion === realAnswer;
    }

    async changeUserPassword(username: string, newPassword: string) {
        const encryptedPassword = this.encryptPassword(newPassword);
        return await this.dbService.changeUserPassword(username, encryptedPassword);
    }

    async getUserId(username: string) {
        return await this.dbService.getUserId(username);
    }

    private async verifyAccountRequirements(username: string, password: string, email: string): Promise<string> {
        let errorCode = NO_ERROR;
        const accountCreationState: AccountCreationState = {
            isUsernameValid: this.validateUsername(username),
            isEmailValid: email.includes(CHAR_EMAIL_MUST_CONTAIN),
            isPasswordValid: password.length >= MIN_USERNAME_LENGTH,
            isUsernameFree: await this.dbService.isUsernameFree(username),
        };

        if (!accountCreationState.isUsernameValid) {
            console.log(new Date().toLocaleTimeString() + ' | Register failed, username too short');
            errorCode = USERNAME_INVALID;
        } else if (!accountCreationState.isEmailValid) {
            console.log(new Date().toLocaleTimeString() + ' | Register failed, invalid email');
            errorCode = EMAIL_INVALID;
        } else if (!accountCreationState.isPasswordValid) {
            console.log(new Date().toLocaleTimeString() + ' | Register failed, password too short');
            errorCode = PASSWORD_INVALID;
        } else if (!accountCreationState.isUsernameFree) {
            console.log(new Date().toLocaleTimeString() + ' | Register failed, username taken');
            errorCode = USERNAME_TAKEN;
        }

        return Promise.resolve(errorCode);
    }

    private validateUsername(username: string): boolean {
        return username.length >= MIN_USERNAME_LENGTH && !username.includes(VIRTUAL_PLAYER_NAME);
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
