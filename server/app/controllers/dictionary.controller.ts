import { Dictionary } from '@app/constants/database-interfaces';
import { DatabaseService } from '@app/services/database.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_BAD_REQUEST = 400;

@Service()
export class DictionaryController {
    router: Router;

    constructor(private readonly databaseService: DatabaseService) {
        this.configureRouter();
    }

    getDatabaseService(): DatabaseService {
        return this.databaseService;
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.post('/', async (req: Request, res: Response) => {
            if (await this.databaseService.addDictionary(req.body as Dictionary)) res.send(JSON.stringify(req.body)).status(HTTP_STATUS_CREATED);
            else res.sendStatus(HTTP_STATUS_BAD_REQUEST);
        });
        this.router.get('/:title', async (req: Request, res: Response) => {
            const dict = await this.databaseService.getDictionary(req.params.title);
            if (dict) res.send(dict).status(HTTP_STATUS_OK);
            else res.sendStatus(HTTP_STATUS_NOT_FOUND);
        });
    }
}
