/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Dictionary } from '@app/constants/database-interfaces';
import { DatabaseService } from '@app/services/database.service';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('DictionaryController', () => {
    let databaseService: sinon.SinonStubbedInstance<DatabaseService>;
    let expressApp: Express.Application;
    let defaultDict: Dictionary;

    beforeEach(async () => {
        defaultDict = {
            title: 'test',
            description: 'test',
            words: ['test'],
        };
        databaseService = sinon.createStubInstance(DatabaseService);
        const app = Container.get(Application);
        Object.defineProperty(app['dictionaryController'], 'databaseService', { value: databaseService });
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return dictionary on valid get request to dictionary', async () => {
        databaseService.getDictionary.resolves(defaultDict);
        return supertest(expressApp)
            .get('/api/dictionary/test')
            .expect(200)
            .then((response) => {
                expect(response.body).to.deep.equal(defaultDict);
            });
    });

    it('should not return dictionary on invalid get request to dictionary', async () => {
        databaseService.getDictionary.resolves(null);
        return supertest(expressApp)
            .get('/api/dictionary/test')
            .expect(404)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('should store dict in the array on valid post request to dictionary', async () => {
        databaseService.addDictionary.resolves(true);
        return supertest(expressApp).post('/api/dictionary').send(defaultDict).set('Accept', 'application/json').expect(200);
    });

    it('should not store dict in the array on invalid post request to dictionary', async () => {
        databaseService.addDictionary.resolves(false);
        return supertest(expressApp).post('/api/dictionary').send(defaultDict).set('Accept', 'application/json').expect(400);
    });
});
