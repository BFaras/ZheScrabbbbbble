import { ProfileInfo } from '@app/interfaces/profile-info';
import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class ProfileService {
    private readonly dbService: DatabaseService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
    }

    async getProfileInformation(username: string): Promise<ProfileInfo> {
        const userId: string = await this.dbService.getUserId(username);
        return await this.dbService.getUserProfileInfo(userId);
    }
}
