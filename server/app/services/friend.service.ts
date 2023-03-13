import { MAX_ASCII_SYMBOL, MIN_ASCII_SYMBOL } from '@app/constants/authentification-constants';
import { FRIEND_CODE_LENGTH } from '@app/constants/profile-constants';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class FriendService {
    private readonly dbService: DatabaseService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
    }

    async generateUniqueFriendCode(): Promise<string> {
        let userFriendCode: string = this.generateFriendCode();

        while (await this.isFriendCodeExistant(userFriendCode)) {
            userFriendCode = this.generateFriendCode();
        }
        return userFriendCode;
    }

    async isFriendCodeExistant(userFriendCode: string): Promise<boolean> {
        return await this.dbService.isFriendCodeTaken(userFriendCode);
    }

    private generateFriendCode(): string {
        let generatedFriendCode = 'Friend';

        for (let i = 0; i < FRIEND_CODE_LENGTH; i++) {
            const randomCharCode = Math.floor(Math.random() * (MAX_ASCII_SYMBOL + 1)) + MIN_ASCII_SYMBOL;
            generatedFriendCode += String.fromCharCode(randomCharCode);
        }

        return generatedFriendCode;
    }
}
