/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-invalid-this */
/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-unresolved */
import { GameSettings } from '@app/classes/game-settings';
import { Player } from '@app/classes/player';
import { ErrorType, GameType } from '@app/constants/basic-constants';
import { Message, Timer } from '@app/constants/basic-interface';
import { SocketManager } from '@app/services/socket-manager.service';
import { Server } from 'app/server';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';

const RESPONSE_DELAY = 300;
describe('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;
    let defaultMultiSettings: GameSettings;
    let defaultSoloSettings: GameSettings;

    const urlString = 'http://localhost:3000';

    beforeEach(async () => {
        server = Container.get(Server);
        await server.init(true);
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
    });

    beforeEach(() => {
        defaultMultiSettings = {
            hostPlayerName: 'Joe',
            isSoloMode: false,
            timer: { minute: 1, second: 0 },
            dictionary: 'DictionaryNameTest',
            roomName: 'testRoom',
            virtualPlayerName: 'VirtualPlayerNameTest',
            isEasyMode: false,
            gameType: GameType.CLASSIC,
        };
        defaultSoloSettings = {
            hostPlayerName: 'Joe',
            isSoloMode: true,
            timer: { minute: 1, second: 0 },
            dictionary: 'DictionaryNameTest',
            roomName: 'solo1',
            virtualPlayerName: 'Bob',
            isEasyMode: true,
            gameType: GameType.CLASSIC,
        };
        sinon
            .mock(service['socketDatabaseService'])
            .expects('getDictionary')
            .returns({ title: 'test', description: 'test', words: ['test'] });
    });

    afterEach(() => {
        clientSocket.close();
        service['sio'].close();
        sinon.restore();
    });
    it('client side should receive message sent from server', (done) => {
        const message: Message = { username: 'Joe', body: 'test', color: 'black' };
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('new-message', message);
        clientSocket.on('new-message', (arg) => {
            assert.deepEqual(arg, message);
            done();
        });
    });

    it('client side should not receive message sent from server if not in a room', (done) => {
        let called = false;
        const message: Message = { username: '[SERVER]', body: 'test', color: 'black' };
        clientSocket.emit('new-message', message);
        clientSocket.on('new-message', () => {
            called = true;
        });
        setTimeout(() => {
            assert.isFalse(called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should add the socket to the room after a createMultiRoom event', (done) => {
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        setTimeout(() => {
            const newRoomSize = service['sio'].sockets.adapter.rooms.get('testRoom')?.size;
            expect(newRoomSize).to.equal(1);
            done();
        }, RESPONSE_DELAY);
    });

    it('should add the socket to the room after a joinRoom event', (done) => {
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('joinRoom', 'user', 'testRoom');
        setTimeout(() => {
            const newRoomSize = service['sio'].sockets.adapter.rooms.get('testRoom')?.size;
            expect(newRoomSize).to.equal(1);
            service['roomManager']['activeRooms']['testRoom']['game']['gameOver'] = true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should add the socket to the room after a createSoloRoom event', (done) => {
        clientSocket.emit('createSoloRoom', defaultSoloSettings);
        setTimeout(() => {
            const newRoomSize = service['sio'].sockets.adapter.rooms.get('solo1')?.size;
            expect(newRoomSize).to.equal(1);
            done();
        }, RESPONSE_DELAY);
    });

    it('should broadcast message to room if origin socket is not in room', (done) => {
        const message: Message = { username: 'Test', body: 'test', color: 'black' };
        const spy = sinon.spy(service['sio'], 'to');
        clientSocket.emit('new-message', message);

        setTimeout(() => {
            assert.isTrue(spy.notCalled);
            done();
        }, RESPONSE_DELAY);
    });

    it('should not broadcast message to room if origin socket is not in room', (done) => {
        const message: Message = { username: 'Test', body: 'test', color: 'black' };
        const spy = sinon.spy(service['sio'], 'to');
        clientSocket.emit('new-message', message);

        setTimeout(() => {
            assert.isFalse(spy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should update player is waiting in the room when player lefts the room', (done) => {
        clientSocket.emit('guestPlayerLeft', 'testRoom');
        clientSocket.on('new-guestPlayerIsWaiting', (arg) => {
            assert.equal(arg, false);
        });
        const spy = sinon.spy(service['sio'], 'to');
        setTimeout(() => {
            service['sio'].emit('new-message', false);
            assert(spy.notCalled);
            done();
        }, RESPONSE_DELAY);
    });

    it('should send a list of player names on getPlayerNames event in Multiplayer', (done) => {
        const names = ['Joe', ''];
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('getPlayerNames');
        clientSocket.on('playerNames', (arg) => {
            assert.deepEqual(arg, names);
            done();
        });
        service['sio'].emit('playerNames', names);
    });

    it('should send a list of player names on getPlayerNames event in Solo', (done) => {
        const names = ['Joe', 'Bob'];
        clientSocket.emit('createSoloRoom', defaultSoloSettings);
        clientSocket.emit('getPlayerNames');
        clientSocket.on('playerNames', (arg) => {
            assert.deepEqual(arg, names);
            done();
        });
        service['sio'].emit('playerNames', names);
    });

    it('should call setUUID on player and send game state if player id is in an active room when reconnect is emited', (done) => {
        const manager = service['roomManager'];
        manager.createRoom(defaultMultiSettings, ['test']);
        const testPlayer = new Player('p1', 'Joe');
        manager.addPlayer(testPlayer, 'testRoom');
        manager.addPlayer(new Player('p2', 'Eve'), 'testRoom');
        const playerSpy = sinon.spy(testPlayer, 'setUUID');
        const gameStateSpy = sinon.spy(service, 'sendGameState' as any);
        clientSocket.emit('reconnect', 'p1');
        setTimeout(() => {
            assert.isTrue(playerSpy.called);
            assert.isTrue(gameStateSpy.called);
            service['roomManager']['activeRooms']['testRoom']['game']['gameOver'] = true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should not do anything if player id is not in an active room when reconnect is emited', (done) => {
        const gameStateSpy = sinon.spy(service, 'sendGameState' as any);
        clientSocket.emit('reconnect', 'p1');
        setTimeout(() => {
            assert.isFalse(gameStateSpy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should call roomManager delete room when deleteRoom tag is emited', (done) => {
        const deleteRoomSpy = sinon.spy(service['roomManager'], 'deleteRoom');
        clientSocket.emit('deleteRoom', 'testRoom');
        setTimeout(() => {
            assert.equal(deleteRoomSpy.called, true);
            assert.equal(deleteRoomSpy.calledWith('testRoom'), true);
            done();
        }, RESPONSE_DELAY);
    });
    it('should call executeCommand when command tag is emited', (done) => {
        const executeCommandSpy = sinon.spy(service['commandController'], 'executeCommand');
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('command', 'placer', 'h8h test');
        setTimeout(() => {
            assert.equal(executeCommandSpy.called, true);
            assert.equal(executeCommandSpy.calledWithMatch({ commandType: 'placer', args: 'h8h test' }), true);
            done();
        }, RESPONSE_DELAY);
    });

    it('should not call executeCommand when command tag is emited but player is not in room', (done) => {
        const executeCommandSpy = sinon.spy(service['commandController'], 'executeCommand');
        clientSocket.emit('command', 'placer', 'h8h test');
        setTimeout(() => {
            assert.equal(executeCommandSpy.called, false);
            done();
        }, RESPONSE_DELAY);
    });

    it('should call handleError when command tag is emited but command is illegal', (done) => {
        const handleErrorSpy = sinon.spy(service, 'handleError');
        sinon.mock(service['commandController']).expects('executeCommand').returns({ errorType: ErrorType.IllegalCommand });
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('command', 'placer', 'h8h test');
        setTimeout(() => {
            assert.equal(handleErrorSpy.called, true);
            assert.equal(handleErrorSpy.calledWith(ErrorType.IllegalCommand), true);
            done();
        }, RESPONSE_DELAY);
    });

    it('should call handleError when command tag is emited but command has invalid syntax', (done) => {
        const handleErrorSpy = sinon.spy(service, 'handleError');
        sinon.mock(service['commandController']).expects('executeCommand').returns({ errorType: ErrorType.InvalidSyntax });
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('command', 'placer', 'h8h test');
        setTimeout(() => {
            assert.equal(handleErrorSpy.called, true);
            assert.equal(handleErrorSpy.calledWith(ErrorType.InvalidSyntax), true);
            done();
        }, RESPONSE_DELAY);
    });
    it('should send end game message when command tag is emited and game is over', (done) => {
        const sioInSpy = sinon.spy(service['sio'], 'in');
        sinon.mock(service['commandController']).expects('executeCommand').returns({ endGameMessage: 'game over' });
        sinon.mock(service).expects('sendGameState').returns(null);
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('command', 'placer', 'h8h test');
        setTimeout(() => {
            assert.isTrue(sioInSpy.called);
            assert.isTrue(sioInSpy.calledWith('testRoom'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should send command message to players when command tag is emited with valid command', (done) => {
        const message: Message = {
            username: '[SERVER]',
            body: 'Joe command valid',
            color: '#cb654f',
        };
        sinon.mock(service['commandController']).expects('executeCommand').returns({ activePlayerMessage: 'command valid' });
        sinon.mock(service).expects('sendGameState').returns(null);
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('command', 'placer', 'h8h test');
        clientSocket.on('new-message', (arg) => {
            assert.deepEqual(arg, message);
            done();
        });
    });

    it('should emit error-room-name when trying to create a room with and existing name', (done) => {
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.on('error-room-name', () => {
            done();
        });
    });

    it('should not call disconnectPlayer if is player is diconnected for less than 5 seconds', (done) => {
        const disconnectMock = sinon.mock(service).expects('disconnectPlayer');
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.disconnect();
        setTimeout(() => {
            assert.isFalse(disconnectMock.called);
            done();
        }, 2000);
    });

    it('should call disconnectPlayer when abandon is emited', (done) => {
        const disconnectMock = sinon.mock(service).expects('disconnectPlayer');
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('abandon');
        setTimeout(() => {
            assert.isTrue(disconnectMock.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should send back guestAnswered when answerGuestPlayer is emited', (done) => {
        const clientSocket2 = ioClient(urlString);
        clientSocket2.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('joinRoom', 'Eve', 'testRoom');
        clientSocket2.emit('answerGuestPlayer', 'testRoom', true, 'test');
        clientSocket.on('guestAnswered', (accepted: boolean, message: string) => {
            assert.isTrue(accepted);
            assert.deepEqual(message, 'test');
            service['roomManager']['activeRooms']['testRoom']['game']['gameOver'] = true;
            clientSocket2.close();
            done();
        });
    });

    it('should send back the waiting rooms when sendWaitingRoom is emited', (done) => {
        clientSocket.emit('sendWaitingRooms');
        clientSocket.on('hereAreTheActiveGames', (rooms) => {
            assert.deepEqual(rooms, service['roomManager'].getWaitingRooms());
            done();
        });
    });

    it('should send back the current timer when sendTimer is emited', (done) => {
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('sendTimer');
        clientSocket.on('hereIsTheTimer', (timer: Timer) => {
            setTimeout(() => {
                assert.deepEqual(timer, { minute: 1, second: 0 });
                done();
            }, 2 * RESPONSE_DELAY);
        });
    });

    it('should send back the current settings when sendCurrentSettings is emited', (done) => {
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('sendCurrentSettings');
        clientSocket.on('hereAreTheSettings', (name: string, timer: Timer) => {
            setTimeout(() => {
                assert.deepEqual(name, 'Joe');
                assert.deepEqual(timer, { minute: 1, second: 0 });
                done();
            }, RESPONSE_DELAY);
        });
    });

    it('should start the game when 2 players have requested the names of other players', (done) => {
        const startGameSpy = sinon.spy(service, 'sendGameState' as any);
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('joinRoom', 'Eve', 'testRoom');
        clientSocket.emit('getPlayerNames');
        clientSocket.emit('getPlayerNames');
        setTimeout(() => {
            assert.isTrue(startGameSpy.called);
            service['roomManager']['activeRooms']['testRoom']['game']['gameOver'] = true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should disconnect the player and send game state when player is disconnected with 2 players in game', (done) => {
        const sendGameStateMock = sinon.mock(service).expects('sendGameState');
        const disconnectSpy = sinon.spy(service, 'disconnectPlayer');
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        setTimeout(() => {
            service['roomManager']['activeRooms']['testRoom'].addPlayer(new Player('1', 'Eve'));
            clientSocket.emit('abandon');
            setTimeout(() => {
                assert.isTrue(disconnectSpy.called);
                assert.isTrue(sendGameStateMock.called);
                done();
            }, RESPONSE_DELAY);
        }, RESPONSE_DELAY);
    });

    it('should remove player from room when abandon is emited but game is over', (done) => {
        const removePlayerSpy = sinon.spy(service['roomManager'], 'removePlayer');
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        setTimeout(() => {
            service['roomManager']['activeRooms']['testRoom']['game']['gameOver'] = true;
            clientSocket.emit('abandon');
            setTimeout(() => {
                assert.isTrue(removePlayerSpy.called);
                done();
            }, RESPONSE_DELAY);
        }, RESPONSE_DELAY);
    });

    it('should remove guest player when the host refuses him', (done) => {
        const removePlayerSpy = sinon.spy(service['roomManager'], 'removePlayer');
        clientSocket.emit('createMultiRoom', defaultMultiSettings);
        clientSocket.emit('answerGuestPlayer', 'testRoom', false, 'test');
        setTimeout(() => {
            assert.isTrue(removePlayerSpy.called);
            done();
        }, 3000);
    });

    it('should call virtual play when game state is received client side', (done) => {
        clientSocket.emit('createSoloRoom', defaultSoloSettings);
        const virtualPlaySpy = sinon.spy(service, 'virtualPlay');
        clientSocket.emit('gameStateReceived');
        setTimeout(() => {
            assert.isTrue(virtualPlaySpy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should send socket id when emiting requestId', (done) => {
        clientSocket.emit('requestId');
        clientSocket.on('sendID', (socketId: string) => {
            assert.equal(socketId, clientSocket.id);
            done();
        });
    });
});
