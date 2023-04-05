// /* eslint-disable @typescript-eslint/no-magic-numbers */
// /* eslint-disable @typescript-eslint/no-unused-expressions */
// /* eslint-disable no-unused-expressions */
// /* eslint-disable dot-notation */
// import { GameRoom } from '@app/classes/game-room';
// import { Player } from '@app/classes/player';
// import { RoomVisibility } from '@app/constants/basic-constants';
// import { expect } from 'chai';
// import 'reflect-metadata';

// describe('GameRoom', () => {
//     let gameRoom: GameRoom;
//     let player1: Player;
//     let player2: Player;
//     let player3: Player;
//     let player4: Player;
//     let player5: Player;

//     beforeEach(() => {
//         gameRoom = new GameRoom('id', 'testRoom', RoomVisibility.Public);
//         player1 = new Player('id1', 'Joe');
//         player2 = new Player('id2', 'Eve');
//         player3 = new Player('id3', 'Bob');
//         player4 = new Player('id4', 'Zoe');
//         player5 = new Player('id5', 'Dan');
//     });

//     it('should not add player when room already has 4 players', () => {
//         gameRoom.addPlayer(player1);
//         gameRoom.addPlayer(player2);
//         gameRoom.addPlayer(player3);
//         gameRoom.addPlayer(player4);
//         gameRoom.addPlayer(player5);
//         expect(gameRoom['players']).to.contain(player1);
//         expect(gameRoom['players']).to.contain(player2);
//         expect(gameRoom['players']).to.contain(player3);
//         expect(gameRoom['players']).to.contain(player4);
//         expect(gameRoom['players']).to.not.contain(player5);
//     });

//     it('should return whether player is in room or not when isPlayerInRoom is called', () => {
//         gameRoom.addPlayer(player1);
//         expect(gameRoom.isPlayerInRoom(player1.getUUID())).to.equal(true);
//         expect(gameRoom.isPlayerInRoom(player2.getUUID())).to.equal(false);
//     });

//     it('should return true and remove player if removePlayer is called with valid player id', () => {
//         gameRoom.addPlayer(player1);
//         gameRoom.addPlayer(player2);
//         expect(gameRoom.removePlayer(player1.getUUID())).to.be.true;
//         expect(gameRoom['players']).to.not.contain(player1);
//         expect(gameRoom['players']).to.contain(player2);
//     });

//     it('should return false and not remove player if removePlayer is called with invalid player id', () => {
//         gameRoom.addPlayer(player1);
//         gameRoom.addPlayer(player2);
//         expect(gameRoom.removePlayer(player3.getUUID())).to.be.false;
//         expect(gameRoom['players']).to.contain(player1);
//         expect(gameRoom['players']).to.contain(player2);
//     });

//     it('should get the correct number of player with get playerCount', () => {
//         expect(gameRoom.getPlayerCount()).to.equals(0);
//         gameRoom.addPlayer(player1);
//         expect(gameRoom.getPlayerCount()).to.equals(1);
//         gameRoom.addPlayer(player2);
//         expect(gameRoom.getPlayerCount()).to.equals(2);
//     });

//     it('should increment and verify the number of player when incrementConnectedPLayers is called', () => {
//         expect(gameRoom.incrementConnectedPlayers()).to.equals(false);
//         expect(gameRoom.incrementConnectedPlayers()).to.equals(false);
//         expect(gameRoom.incrementConnectedPlayers()).to.equals(false);
//         expect(gameRoom.incrementConnectedPlayers()).to.equals(true);
//     });

//     it('should return the first player added to a room when calling getHostPlayer', () => {
//         gameRoom.addPlayer(player1);
//         gameRoom.addPlayer(player2);
//         gameRoom.addPlayer(player3);
//         expect(gameRoom.getHostPlayer()).to.equals(player1);
//         gameRoom.removePlayer(player1.getUUID());
//         expect(gameRoom.getHostPlayer()).to.equals(player2);
//     });

//     it('should return the correct player when calling getPlayerFromIndex', () => {
//         gameRoom.addPlayer(player1);
//         gameRoom.addPlayer(player2);
//         gameRoom.addPlayer(player3);
//         gameRoom.addPlayer(player4);
//         expect(gameRoom.getPlayerFromIndex(0)).to.equals(player1);
//         expect(gameRoom.getPlayerFromIndex(1)).to.equals(player2);
//         expect(gameRoom.getPlayerFromIndex(2)).to.equals(player3);
//         expect(gameRoom.getPlayerFromIndex(3)).to.equals(player4);
//     });

//     it('should return the room id when calling getId', () => {
//         expect(gameRoom.getID()).to.equals('id');
//     });

//     it('should return the room visibility when calling getVisibility', () => {
//         expect(gameRoom.getVisibility()).to.equals(RoomVisibility.Public);
//     });

//     it('should return the name of the room calling getName', () => {
//         expect(gameRoom.getName()).to.equals('testRoom');
//     });

//     it('should return a list of names when calling getPlayerNames', () => {
//         gameRoom.addPlayer(player1);
//         gameRoom.addPlayer(player2);
//         gameRoom.addPlayer(player3);
//         gameRoom.addPlayer(player4);
//         expect(gameRoom.getPlayerNames()).to.eql(['Joe', 'Eve', 'Bob', 'Zoe']);
//     });

//     it('should return the correct output when calling verifyPassword', () => {
//         gameRoom = new GameRoom('id', 'testRoom', RoomVisibility.Protected, 'password');
//         expect(gameRoom.verifyPassword('password')).to.equals(true);
//         expect(gameRoom.verifyPassword('password123')).to.equals(false);
//     });

//     // it('should change the status of the game to started when calling start game', () => {
//     //     expect(gameRoom.isGameStarted()).to.equals(false);
//     //     gameRoom.startGame();
//     //     expect(gameRoom.isGameStarted()).to.equals(true);
//     //     gameRoom.startGame();
//     //     expect(gameRoom.isGameStarted()).to.equals(true);
//     // });
// });
