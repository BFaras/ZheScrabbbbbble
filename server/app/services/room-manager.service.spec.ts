/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
// import "reflect-metadata"
// import { Player } from '@app/classes/player';
// import { expect } from 'chai';
// import { RoomManagerService } from './room-manager.service';
// import { RoomVisibility } from "@app/constants/basic-constants";

// describe('RoomManagerService', () => {
//     let roomManagerService: RoomManagerService;
//     let player1: Player;
//     let player2: Player;
//     let id1: string;
//     let id2: string;

//     beforeEach(() => {
//         roomManagerService = new RoomManagerService();
//         id1 = roomManagerService.createRoom('public', RoomVisibility.Public);
//         id2 = roomManagerService.createRoom('protected', RoomVisibility.Protected, 'password');
//         player1 = new Player('id1', 'Joe');
//         player2 = new Player('id2', 'Eve');
//     });

//     it('should create a room when createRoom is called', () => {
//         expect(roomManagerService['activeRooms']).to.have.property(id1);
//         expect(roomManagerService['activeRooms']).to.not.have.property('testId');
//     });

//     it('should add a player to the correct room when addPlayer is called', () => {
//         expect(roomManagerService.addPlayer(id1, player1)).to.equal(true);
//         expect(roomManagerService['activeRooms'][id1]['players']).to.contain(player1);
//         expect(roomManagerService['activeRooms'][id1]['players']).to.not.contain(player2);
//     });

//     it('should not add a player to the correct room when addPlayer is called to protected room with wrong password', () => {
//         expect(roomManagerService.addPlayer(id2, player1)).to.equal(false);
//         expect(roomManagerService['activeRooms'][id2]['players']).to.not.contain(player1);
//         expect(roomManagerService.addPlayer(id2, player2, 'password123')).to.equal(false);
//         expect(roomManagerService['activeRooms'][id2]['players']).to.not.contain(player2);
//     });

//     it('should add a player to the correct room when addPlayer is called to protected room with correct password', () => {
//         expect(roomManagerService.addPlayer(id2, player1, 'password')).to.equal(true);
//         expect(roomManagerService['activeRooms'][id2]['players']).to.contain(player1);
//     });

//     it('should return if the room exists when verifyIfRoomExists is called', () => {
//         expect(roomManagerService.verifyIfRoomExists('public')).to.equal(true);
//         expect(roomManagerService.verifyIfRoomExists('testRoom')).to.equal(false);
//     });

//     it('should return room player is in if player is in a room when findRoomFromPlayer is called', () => {
//         roomManagerService.addPlayer(id1, player1);
//         expect(roomManagerService.findRoomFromPlayer(player1.getUUID())).to.eql(roomManagerService['activeRooms'][id1]);
//     });

//     it('should return null if player is not in a room when findRoomFromPlayer is called', () => {
//         expect(roomManagerService.findRoomFromPlayer(player1.getUUID())).to.be.null;
//     });

//     it('should delete player if deletePlayer is called', () => {
//         roomManagerService.addPlayer(id1, player1);
//         roomManagerService.addPlayer(id1, player2);
//         roomManagerService.removePlayer(id1, player1.getUUID());
//         expect(roomManagerService.findRoomFromPlayer(player1.getUUID())).to.be.null;
//         expect(roomManagerService.findRoomFromPlayer(player2.getUUID())).to.eql(roomManagerService['activeRooms'][id1]);
//     });

//     it('should delete room if deletePlayer deletes last player in room', () => {
//         roomManagerService.addPlayer(id1, player1);
//         roomManagerService.removePlayer(id1, player1.getUUID());
//         expect(roomManagerService.verifyIfRoomExists('public')).to.be.false;
//     });

//     it("should not delete room if deletePlayer doesn't delete last player in room", () => {
//         roomManagerService.addPlayer(id1, player1);
//         roomManagerService.addPlayer(id1, player2);
//         roomManagerService.removePlayer(id1, player1.getUUID());
//         expect(roomManagerService.verifyIfRoomExists('public')).to.be.true;
//     });
//     it('should remove room from active room when delete room is called', () => {
//         expect(roomManagerService.verifyIfRoomExists('public')).to.be.true;
//         roomManagerService.deleteRoom(id1);
//         expect(roomManagerService.verifyIfRoomExists('public')).to.be.false;
//     });

//     it('should return information on all the rooms when calling getGameRooms', () => {
//         roomManagerService.addPlayer(id1, player1);
//         const gameRoomInfo = roomManagerService.getGameRooms();
//         expect(gameRoomInfo.length).to.equal(2);
//         expect(gameRoomInfo[0].name).to.equal('public');
//         expect(gameRoomInfo[0].id).to.equal(id1);
//         expect(gameRoomInfo[0].visibility).to.equal(RoomVisibility.Public);
//         expect(gameRoomInfo[0].players).to.eql(['Joe']);
//         expect(gameRoomInfo[0].isStarted).to.equal(false);
//         expect(gameRoomInfo[1].name).to.equal('protected');
//         expect(gameRoomInfo[1].id).to.equal(id2);
//         expect(gameRoomInfo[1].visibility).to.equal(RoomVisibility.Protected);
//         expect(gameRoomInfo[1].players).to.eql([]);
//         expect(gameRoomInfo[1].isStarted).to.equal(false);
//     });

//     it('should return the names of the players in the room when calling getRoomPlayerNames', () => {
//         roomManagerService.addPlayer(id1, player1);
//         roomManagerService.addPlayer(id1, player2);
//         expect(roomManagerService.getRoomPlayerNames(id1)).to.eql(['Joe', 'Eve']);
//     });

//     it('should return the room visibility when calling getRoomVisibility', () => {
//         expect(roomManagerService.getRoomVisibility(id1)).to.equal(RoomVisibility.Public);
//         expect(roomManagerService.getRoomVisibility(id2)).to.equal(RoomVisibility.Protected);
//     });

//     it('should return the first player added to a room when calling getRoomHost', () => {
//         roomManagerService.addPlayer(id1, player1);
//         roomManagerService.addPlayer(id1, player2);
//         expect(roomManagerService.getRoomHost(id1)).to.equals(player1);
//     });
// });
