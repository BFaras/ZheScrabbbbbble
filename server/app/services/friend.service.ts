import { Container, Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class FriendService {
    private readonly dbService: DatabaseService;

    constructor() {
        this.dbService = Container.get(DatabaseService);
    }
}
