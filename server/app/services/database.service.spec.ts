/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { CollectionType, Dictionary, VirtualPlayerDifficulty } from '@app/constants/database-interfaces';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as sinon from 'sinon';
import { DatabaseService } from './database.service';

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;

    beforeEach(async () => {
        databaseService = new DatabaseService();
        mongoServer = new MongoMemoryServer();
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close();
        }
    });

    it('should connect to the database and fill it when start is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const scores = await databaseService['getCollection'](CollectionType.SCORE).find({}).toArray();
        expect(databaseService['client']).to.not.be.undefined;
        expect(databaseService['db'].databaseName).to.equal('ScrabbleLOG3900');
        expect(scores.length).to.equal(5);
    });

    it('should throw an error when start is called with invalid uri', async () => {
        let error = false;
        await databaseService.start('test').catch(() => {
            error = true;
        });
        expect(error).to.be.true;
    });

    it('should add score to database when calling add score', async () => {
        const stubScore = {
            username: 'test',
            score: 0,
        };
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const initalDb = await databaseService.database.collection('scoreboardClassic').find({}).toArray();
        expect(initalDb.length).to.equal(5);
        await databaseService.addScore(stubScore);
        const modifiedDb = await databaseService.database.collection('scoreboardClassic').find({}).toArray();
        expect(modifiedDb[modifiedDb.length - 1]).to.deep.equal(stubScore);
    });

    it('should return an empty object if database is empty when calling get top scores', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService['db'].collection('scoreboardClassic').deleteMany({});
        const result = await databaseService.getTopScores(5);
        expect(result).to.deep.equal({});
    });

    it('should return top scores even if database has less than the number of asked scores', async () => {
        const stubScore = {
            username: 'test',
            score: 0,
        };
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.addScore(stubScore);
        const result = await databaseService.getTopScores(6);
        expect(result['0']).to.deep.equal(['test']);
    });

    it('should delete dictionary when calling delete dictionary', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.deleteDictionary('Mon dictionnaire');
        const result = await databaseService.getDictionaryList();
        expect(result.length).to.equal(0);
    });

    it('should return dictionary when calling get dictionary', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const result = (await databaseService.getDictionary()) as Dictionary;
        expect(result.title).to.deep.equal('Mon dictionnaire');
    });

    it('should return null when calling get dictionary with name that does not exist', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const result = await databaseService.getDictionary('Test');
        expect(result).to.be.null;
    });

    it('should return dictionary names and descriptions when calling get dictionary list', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const result = await databaseService.getDictionaryList();
        expect(result[0]).to.deep.equal({ title: 'Mon dictionnaire', description: 'Description de base' });
    });

    it('should edit dictionary when calling edit dictionary', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.editDictionary('Mon dictionnaire', { title: 'testTitle', description: 'testDescription' });
        const result = (await databaseService.getDictionary('testTitle')) as Dictionary;
        expect(result.description).to.deep.equal('testDescription');
    });

    it('should not edit dictionary to a name that already exists', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.addDictionary({ title: 'testTitle', description: 'testDescription1', words: ['testWord'] });
        await databaseService.editDictionary('Mon dictionnaire', { title: 'testTitle', description: 'testDescription2' });
        const result = (await databaseService.getDictionary('Mon dictionnaire')) as Dictionary;
        expect(result.description).to.deep.equal('Description de base');
    });

    it('should edit dictionary if only the description is different', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.editDictionary('Mon dictionnaire', { title: 'Mon dictionnaire', description: 'testDescription' });
        const result = (await databaseService.getDictionary('Mon dictionnaire')) as Dictionary;
        expect(result.description).to.deep.equal('testDescription');
    });

    it('should add a dictionary when calling add dictionary', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.addDictionary({ title: 'testTitle', description: 'testDescription', words: ['testWord'] });
        const result = await databaseService.getDictionary('testTitle');
        expect(result).to.deep.equal({ title: 'testTitle', description: 'testDescription', words: ['testWord'] });
    });

    it('should not add a dictionary when calling add dictionary with duplicate name', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.addDictionary({ title: 'testTitle', description: 'testDescription1', words: ['testWord'] });
        await databaseService.addDictionary({ title: 'testTitle', description: 'testDescription2', words: ['testWord'] });
        const result = await databaseService.getDictionaryList();
        expect(result.length).to.equal(2);
    });

    it('should only return the highest scores when calling get top scores', async () => {
        const stubScoreSmall = {
            username: 'test1',
            score: 0,
        };
        const stubScoreBig = {
            username: 'test2',
            score: 1,
        };
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.addScore(stubScoreSmall);
        await databaseService.addScore(stubScoreBig);
        const result = await databaseService.getTopScores(6);
        expect(result['0']).to.be.undefined;
        expect(result['1']).to.deep.equal(['test2']);
    });

    it('should call client close() when calling close connection', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const closeConnectionSpy = sinon.spy(databaseService['client'], 'close');
        await databaseService.closeConnection();
        expect(closeConnectionSpy.called).to.be.true;
    });

    it('should not populate the database with start function if it is already populated', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        let scores = await databaseService.database.collection('scoreboardClassic').find({}).toArray();
        expect(scores.length).to.equal(5);
        await databaseService.closeConnection();
        await databaseService.start(mongoUri);
        scores = await databaseService.database.collection('scoreboardClassic').find({}).toArray();
        expect(scores.length).to.equal(5);
    });

    it('should return virtual player names when calling get player name list with difficulty', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const resultsBeginner = await databaseService.getPlayerNameList(VirtualPlayerDifficulty.BEGINNER);
        const resultsExpert = await databaseService.getPlayerNameList(VirtualPlayerDifficulty.EXPERT);
        expect(resultsBeginner.length).to.equal(3);
        expect(resultsBeginner[0].difficulty).to.equal(VirtualPlayerDifficulty.BEGINNER);
        expect(resultsExpert.length).to.equal(3);
        expect(resultsExpert[0].difficulty).to.equal(VirtualPlayerDifficulty.EXPERT);
    });

    it('should return all virtual player names when calling get player name list with no parameter', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const results = await databaseService.getPlayerNameList();
        expect(results.length).to.equal(6);
    });

    it('should delete playerNames when calling delete player names', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.deletePlayerName('Joe');
        const result = await databaseService.getPlayerNameList(VirtualPlayerDifficulty.EXPERT);
        expect(result.length).to.equal(2);
    });

    it('should edit playerNames when calling edit player names', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.editPlayerName('Joe', { name: 'Anthony', difficulty: VirtualPlayerDifficulty.BEGINNER, default: true });
        const result = await databaseService.getPlayerNameList(VirtualPlayerDifficulty.BEGINNER);
        expect(result.length).to.equal(4);
    });

    it('should not edit player name to a name that already exists', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.editPlayerName('Joe', { name: 'Alex', difficulty: VirtualPlayerDifficulty.BEGINNER, default: true });
        const result = await databaseService.getPlayerNameList(VirtualPlayerDifficulty.BEGINNER);
        expect(result.length).to.equal(3);
    });

    it('should edit player name if only the difficulty is different', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.editPlayerName('Joe', { name: 'Joe', difficulty: VirtualPlayerDifficulty.BEGINNER, default: true });
        const result = await databaseService.getPlayerNameList(VirtualPlayerDifficulty.BEGINNER);
        expect(result.length).to.equal(4);
    });

    it('should add a player name when calling add player name', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.addPlayerName({ name: 'Mike', difficulty: VirtualPlayerDifficulty.BEGINNER, default: true });
        const result = await databaseService.getPlayerNameList(VirtualPlayerDifficulty.BEGINNER);
        expect(result[3]).to.deep.equal({ name: 'Mike', difficulty: VirtualPlayerDifficulty.BEGINNER, default: false });
    });

    it('should not add a player name when calling add player name with duplicate name', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.addPlayerName({ name: 'Joe', difficulty: VirtualPlayerDifficulty.BEGINNER, default: true });
        const result = await databaseService.getPlayerNameList(VirtualPlayerDifficulty.BEGINNER);
        expect(result.length).to.equal(3);
    });

    it('should add a game to game history when calling add game history', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.addGameHistory({
            date: '4 avril 2022',
            time: '4h53',
            length: '33 min',
            player1: { name: 'Joe', score: 10, virtual: true, difficulty: VirtualPlayerDifficulty.EXPERT, winner: true },
            player2: { name: 'Mike', score: 15, virtual: false, winner: false },
            abandoned: false,
        });
        const result = await databaseService.getGameHistoryList();
        expect(result[0]).to.deep.equal({
            date: '4 avril 2022',
            time: '4h53',
            length: '33 min',
            player1: { name: 'Joe', score: 10, virtual: true, difficulty: VirtualPlayerDifficulty.EXPERT, winner: true },
            player2: { name: 'Mike', score: 15, virtual: false, winner: false },
            abandoned: false,
        });
    });

    it('should remove added elements when calling resetDB', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.addPlayerName({ name: 'Mike', difficulty: VirtualPlayerDifficulty.BEGINNER, default: true });
        const result1 = await databaseService.getPlayerNameList();
        expect(result1.length).to.equal(7);
        await databaseService.resetDB();
        const result2 = await databaseService.getPlayerNameList();
        expect(result2.length).to.equal(6);
    });
});
