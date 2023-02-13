/* eslint-disable import/no-named-as-default */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { CollectionType, TopScores, VirtualPlayerDifficulty } from '@app/constants/database-interfaces';
import { Server } from '@app/server';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import Container from 'typedi';
import { SocketDatabaseService } from './socket-database.service';
import { SocketManager } from './socket-manager.service';

describe('SocketDatabase service tests', () => {
    let socketDatabaseService: SocketDatabaseService;
    let socketService: SocketManager;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';
    const RESPONSE_DELAY = 300;

    beforeEach(async () => {
        server = Container.get(Server);
        await server.init(true);
        socketService = server['socketManager'];
        socketDatabaseService = socketService['socketDatabaseService'];
        clientSocket = ioClient(urlString);
    });

    afterEach(() => {
        clientSocket.close();
        socketService['sio'].close();
        sinon.restore();
    });

    it('should send both scores to database when sendScoreToDatabase is called with no disconnect', () => {
        const addScoreMock = sinon.mock(socketDatabaseService['databaseService']).expects('addScore').twice();
        const joeScore = {
            username: 'Joe',
            score: 0,
        };
        const eveScore = {
            username: 'Eve',
            score: 1,
        };
        socketDatabaseService.sendScoreToDatabase(joeScore, eveScore, false, false);
        assert.isTrue(addScoreMock.getCall(0).calledWith(joeScore));
        assert.isTrue(addScoreMock.getCall(1).calledWith(eveScore));
        addScoreMock.reset();
    });

    it('should send opponent score to database when sendScoreToDatabase is called with disconnect', () => {
        const addScoreMock = sinon.mock(socketDatabaseService['databaseService']).expects('addScore').once();
        const joeScore = {
            username: 'Joe',
            score: 0,
        };
        const eveScore = {
            username: 'Eve',
            score: 1,
        };
        socketDatabaseService.sendScoreToDatabase(joeScore, eveScore, true, false);
        assert.isFalse(addScoreMock.calledWith(joeScore));
        assert.isTrue(addScoreMock.calledWith(eveScore));
        addScoreMock.reset();
    });

    it('should send your score to database when sendScoreToDatabase is called in solo game', () => {
        const addScoreMock = sinon.mock(socketDatabaseService['databaseService']).expects('addScore').once();
        const joeScore = {
            username: 'Joe',
            score: 0,
        };
        const eveScore = {
            username: 'Eve',
            score: 1,
        };
        socketDatabaseService.sendScoreToDatabase(joeScore, eveScore, false, true);
        assert.isTrue(addScoreMock.calledWith(joeScore));
        assert.isFalse(addScoreMock.calledWith(eveScore));
        addScoreMock.reset();
    });

    it('should call sendTopScores when requestTopScores is emited', (done) => {
        const sendTopScoresMock = sinon.mock(socketDatabaseService).expects('sendTopScores');
        clientSocket.emit('requestTopScores', 5);
        setTimeout(() => {
            assert.isTrue(sendTopScoresMock.called);
            done();
        }, 2 * RESPONSE_DELAY);
    });

    it('should send top scores when sendTopScores is called', (done) => {
        const getTopScoresMock = sinon
            .mock(socketDatabaseService['databaseService'])
            .expects('getTopScores')
            .once()
            .returns(
                new Promise<TopScores>((resolve) => {
                    resolve({});
                }),
            );
        clientSocket.emit('requestTopScores', 5);
        clientSocket.on('topScores', () => {
            assert(getTopScoresMock.called);
            done();
        });
    });

    it('should get dictionary list when emiting getDictionaryList', (done) => {
        const getDictionaryListMock = sinon.mock(socketDatabaseService['databaseService']).expects('getDictionaryList');
        clientSocket.emit('getDictionaryList');
        clientSocket.on('dictionaryList', () => {
            assert(getDictionaryListMock.called);
            done();
        });
    });

    it('should call delete dictionnary name when emiting deleteDictionary', (done) => {
        const deleteDictionaryMock = sinon.mock(socketDatabaseService['databaseService']).expects('deleteDictionary');
        clientSocket.emit('deleteDictionary', 'Ant');
        setTimeout(() => {
            assert.isTrue(deleteDictionaryMock.calledWith('Ant'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should call edit dictionary when emiting editDictionary', (done) => {
        const editDictionaryMock = sinon.mock(socketDatabaseService['databaseService']).expects('editDictionary').returns(true);
        clientSocket.emit('editDictionary', 'dictName', { title: 'testTitle', description: 'testDescription' });
        setTimeout(() => {
            assert.isTrue(editDictionaryMock.calledWith('dictName', { title: 'testTitle', description: 'testDescription' }));
            done();
        }, RESPONSE_DELAY);
    });

    it('should return error when emiting editDictionary with existing name', (done) => {
        const editDictionaryMock = sinon.mock(socketDatabaseService['databaseService']).expects('editDictionary').returns(false);
        clientSocket.emit('editDictionary', 'dictName', { title: 'testTitle', description: 'testDescription' });
        clientSocket.on('adminError', () => {
            assert.isTrue(editDictionaryMock.calledWith('dictName', { title: 'testTitle', description: 'testDescription' }));
            done();
        });
    });

    it('should send player name list when emiting getVirtualPlayerNames', (done) => {
        const getPlayerNameListMock = sinon.mock(socketDatabaseService['databaseService']).expects('getPlayerNameList');
        clientSocket.emit('getVirtualPlayerNames');
        clientSocket.on('virtualPlayerNames', () => {
            assert(getPlayerNameListMock.calledWith(undefined));
            done();
        });
    });

    it('should return error when emiting editVirtualPlayerNames with existing name', (done) => {
        const editPlayerNameMock = sinon.mock(socketDatabaseService['databaseService']).expects('editPlayerName').returns(false);
        clientSocket.emit('editVirtualPlayerNames', 'Joe', { name: 'Ant', difficulty: VirtualPlayerDifficulty.BEGINNER });
        clientSocket.on('adminError', () => {
            assert.isTrue(editPlayerNameMock.calledWith('Joe', { name: 'Ant', difficulty: VirtualPlayerDifficulty.BEGINNER }));
            done();
        });
    });

    it('should call edit player name when emiting editVirtualPlayerNames', (done) => {
        const editPlayerNameMock = sinon.mock(socketDatabaseService['databaseService']).expects('editPlayerName').returns(true);
        clientSocket.emit('editVirtualPlayerNames', 'Joe', { name: 'Ant', difficulty: VirtualPlayerDifficulty.BEGINNER });
        setTimeout(() => {
            assert.isTrue(editPlayerNameMock.calledWith('Joe', { name: 'Ant', difficulty: VirtualPlayerDifficulty.BEGINNER }));
            done();
        }, RESPONSE_DELAY);
    });

    it('should call add player name when emiting addVirtualPlayerNames', (done) => {
        const addPlayerNameMock = sinon.mock(socketDatabaseService['databaseService']).expects('addPlayerName');
        clientSocket.emit('addVirtualPlayerNames', { name: 'Ant', difficulty: VirtualPlayerDifficulty.BEGINNER });
        setTimeout(() => {
            assert.isTrue(addPlayerNameMock.calledWith({ name: 'Ant', difficulty: VirtualPlayerDifficulty.BEGINNER }));
            done();
        }, RESPONSE_DELAY);
    });

    it('should call delete player name when emiting deleteVirtualPlayerNames', (done) => {
        const deletePlayerNameMock = sinon.mock(socketDatabaseService['databaseService']).expects('deletePlayerName');
        clientSocket.emit('deleteVirtualPlayerNames', 'Ant');
        setTimeout(() => {
            assert.isTrue(deletePlayerNameMock.calledWith('Ant'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should send history list when emiting getGameHistoryList', (done) => {
        const getHistoryListMock = sinon.mock(socketDatabaseService['databaseService']).expects('getGameHistoryList').returns({});
        clientSocket.emit('getGameHistoryList');
        clientSocket.on('historyList', () => {
            assert.isTrue(getHistoryListMock.called);
            done();
        });
    });

    it('should call resetDB list when emiting resetDatabase', (done) => {
        const resetDatabaseMock = sinon.mock(socketDatabaseService['databaseService']).expects('resetDB');
        sinon.mock(socketDatabaseService['databaseService']).expects('getPlayerNameList');
        sinon.mock(socketDatabaseService['databaseService']).expects('getDictionaryList');
        sinon.mock(socketDatabaseService['databaseService']).expects('getGameHistoryList');
        clientSocket.emit('resetDatabase');
        clientSocket.on('historyList', () => {
            assert.isTrue(resetDatabaseMock.called);
            done();
        });
    });

    it('should call resetDB list when emiting resetCollection', (done) => {
        const resetDatabaseMock = sinon.mock(socketDatabaseService['databaseService']).expects('resetCollection');
        sinon.mock(socketDatabaseService['databaseService']).expects('getPlayerNameList');
        sinon.mock(socketDatabaseService['databaseService']).expects('getDictionaryList');
        sinon.mock(socketDatabaseService['databaseService']).expects('getGameHistoryList');
        clientSocket.emit('resetCollection', CollectionType.DICTIONARY);
        clientSocket.on('historyList', () => {
            assert.isTrue(resetDatabaseMock.calledWith(CollectionType.DICTIONARY));
            done();
        });
    });

    it('should call addGameHistory list when calling sendGameHistoryToDatabase', () => {
        const gameHistory = {
            date: 'test',
            time: 'test',
            length: 'test',
            player1: { name: 'test1', score: 0, virtual: false, winner: false },
            player2: { name: 'test2', score: 0, virtual: false, winner: true },
        };
        const addGameHistoryMock = sinon.mock(socketDatabaseService['databaseService']).expects('addGameHistory');
        socketDatabaseService.sendGameHistoryToDatabase(gameHistory);
        assert.isTrue(addGameHistoryMock.calledWith(gameHistory));
    });
});
