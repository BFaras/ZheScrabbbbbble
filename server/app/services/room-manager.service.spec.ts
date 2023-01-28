/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { GameSettings } from '@app/classes/game-settings';
import { Player } from '@app/classes/player';
import { GameType } from '@app/constants/basic-constants';
import { expect } from 'chai';
import { RoomManagerService } from './room-manager.service';

describe('RoomManagerService', () => {
    let roomManagerService: RoomManagerService;
    let player1: Player;
    let player2: Player;
    let gameSettings: GameSettings;

    beforeEach(() => {
        roomManagerService = new RoomManagerService(undefined);
        gameSettings = {
            hostPlayerName: 'HostPlayerNameTest',
            isSoloMode: true,
            timer: { minute: 1, second: 0 },
            dictionary: 'DictionaryNameTest',
            roomName: 'testRoom',
            virtualPlayerName: 'VirtualPlayerNameTest',
            isEasyMode: true,
            gameType: GameType.CLASSIC,
        };
        roomManagerService.createRoom(gameSettings, roomManagerService['defaultWordValidationService']['dictionary']);
        player1 = new Player('id1', 'Joe');
        player2 = new Player('id2', 'Eve');
    });

    it('should create a room when createRoom is called', () => {
        expect(roomManagerService['activeRooms']).to.have.key('testRoom');
        expect(roomManagerService['activeRooms']).to.not.have.key('testRoom2');
    });

    it('should add a player to the correct room when addPlayer is called', () => {
        roomManagerService.addPlayer(player1, 'testRoom');
        expect(roomManagerService['activeRooms']['testRoom']['players']).to.contain(player1);
        expect(roomManagerService['activeRooms']['testRoom']['players']).to.not.contain(player2);
    });

    it('should return if the room exists when verifyIfRoomExists is called', () => {
        expect(roomManagerService.verifyIfRoomExists('testRoom')).to.equal(true);
        expect(roomManagerService.verifyIfRoomExists('testRoom2')).to.equal(false);
    });

    it('should return room player is in if player is in a room when findRoomFromPlayer is called', () => {
        roomManagerService.addPlayer(player1, 'testRoom');
        const room = roomManagerService['activeRooms']['testRoom'];
        expect(roomManagerService.findRoomFromPlayer(player1.getUUID())).to.eql(room);
    });

    it('should return null if player is not in a room when findRoomFromPlayer is called', () => {
        expect(roomManagerService.findRoomFromPlayer(player1.getUUID())).to.be.null;
    });

    it('should delete player if deletePlayer is called', () => {
        roomManagerService.addPlayer(player1, 'testRoom');
        roomManagerService.removePlayer(player1.getUUID(), 'testRoom');
        expect(roomManagerService.findRoomFromPlayer(player1.getUUID())).to.be.null;
    });

    it('should delete room if deletePlayer deletes last player in room', () => {
        roomManagerService.addPlayer(player1, 'testRoom');
        roomManagerService.removePlayer(player1.getUUID(), 'testRoom');
        expect(roomManagerService.verifyIfRoomExists('testRoom')).to.be.false;
    });

    it("should not delete room if deletePlayer doesn't delete las player in room", () => {
        roomManagerService.addPlayer(player1, 'testRoom');
        roomManagerService.addPlayer(player2, 'testRoom');
        roomManagerService.removePlayer(player1.getUUID(), 'testRoom');
        expect(roomManagerService.verifyIfRoomExists('testRoom')).to.be.true;
    });
    it('should remove room from active room when delete room is called', () => {
        expect(roomManagerService.verifyIfRoomExists('testRoom')).to.be.true;
        roomManagerService.deleteRoom('testRoom');
        expect(roomManagerService.verifyIfRoomExists('testRoom')).to.be.false;
    });

    it('createSoloRoomName should create solo1 when soloRooms.length == 0', () => {
        expect(roomManagerService.createSoloRoomName()).to.equal('solo1');
    });

    it('createSoloRoomName should create solo2 when soloRooms.length == 1', () => {
        const roomName = roomManagerService.createSoloRoomName();
        gameSettings.roomName = roomName;
        roomManagerService.createRoom(gameSettings, ['test']);
        expect(roomManagerService.createSoloRoomName()).to.equal('solo2');
    });
});
