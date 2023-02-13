/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { GameRoom } from '@app/classes/game-room';
import { Player } from '@app/classes/player';
import { Timer } from '@app/constants/basic-interface';
import { WordValidation } from '@app/services/word-validation.service';
import { expect } from 'chai';
import { GameSettings } from './game-settings';
import { VirtualPlayerEasy } from './virtual-player-easy';

describe('GameRoom', () => {
    let gameRoom: GameRoom;
    let player1: Player;
    let player2: Player;
    let player3: Player;
    let timerTest = new Timer();

    beforeEach(() => {
        timerTest = { minute: 1, second: 0 };
        const gameSettings: GameSettings = {
            hostPlayerName: 'HostPlayerNameTest',
            isSoloMode: false,
            timer: timerTest,
            dictionary: 'DictionaryNameTest',
            roomName: 'RoomNameTest',
            virtualPlayerName: 'VirtualPlayerNameTest',
            isEasyMode: true,
        };
        const wordValidationService: WordValidation = new WordValidation(['ma']);
        gameRoom = new GameRoom('testRoom', wordValidationService, gameSettings);
        player1 = new Player('id1', 'Joe');
        player2 = new Player('id2', 'Eve');
        player3 = new Player('id3', 'Dan');
    });

    it('should not add player when room already has 2 players', () => {
        gameRoom.addPlayer(player1);
        gameRoom.addPlayer(player2);
        gameRoom.addPlayer(player3);
        expect(gameRoom['players']).to.contain(player1);
        expect(gameRoom['players']).to.contain(player2);
        expect(gameRoom['players']).to.not.contain(player3);
    });

    it('should return whether player is in room or not when isPlayerInRoom is called', () => {
        gameRoom.addPlayer(player1);
        expect(gameRoom.isPlayerInRoom(player1.getUUID())).to.equal(true);
        expect(gameRoom.isPlayerInRoom(player2.getUUID())).to.equal(false);
    });

    it('should return whether player has turn when isPlayerTurn is called', () => {
        player1['playerHasTurn'] = false;
        player2['playerHasTurn'] = true;
        gameRoom.addPlayer(player1);
        gameRoom.addPlayer(player2);
        expect(gameRoom.isPlayerTurn(player1.getUUID())).to.be.false;
        expect(gameRoom.isPlayerTurn(player2.getUUID())).to.be.true;
    });

    it('should return false if player not in room when isPlayerTurn is called', () => {
        expect(gameRoom.isPlayerTurn(player1.getUUID())).to.be.false;
    });

    it('should return true and remove player if removePlayer is called with valid player id', () => {
        gameRoom.addPlayer(player1);
        gameRoom.addPlayer(player2);
        expect(gameRoom.removePlayer(player1.getUUID())).to.be.true;
        expect(gameRoom['players']).to.not.contain(player1);
        expect(gameRoom['players']).to.contain(player2);
    });

    it('should return false and not remove player if removePlayer is called with invalid player id', () => {
        gameRoom.addPlayer(player1);
        gameRoom.addPlayer(player2);
        expect(gameRoom.removePlayer(player3.getUUID())).to.be.false;
        expect(gameRoom['players']).to.contain(player1);
        expect(gameRoom['players']).to.contain(player2);
    });
    it('should get the correct number of player with get playerCount', () => {
        expect(gameRoom.getPlayerCount()).to.equals(0);
        gameRoom.addPlayer(player1);
        expect(gameRoom.getPlayerCount()).to.equals(1);
        gameRoom.addPlayer(player2);
        expect(gameRoom.getPlayerCount()).to.equals(2);
    });
    it('should return of the active and inactive player correctly with getPLayerIndex', () => {
        gameRoom.addPlayer(player1);
        gameRoom.addPlayer(player2);
        gameRoom['players'][0].swapTurn();
        expect(gameRoom.getPlayerIndex(true)).to.equals(0);
        expect(gameRoom.getPlayerIndex(false)).to.equals(1);
    });
    it('should increment and verify the number of player when incrementConnectedPLayers is called', () => {
        expect(gameRoom.incrementConnectedPlayers()).to.equals(false);
        expect(gameRoom.incrementConnectedPlayers()).to.equals(true);
    });
    it('should swap the disconnecting player with an virtual player', () => {
        gameRoom.addPlayer(player1);
        gameRoom.addPlayer(player2);
        const virtualPlayer = new VirtualPlayerEasy('Manuel', gameRoom);
        expect(gameRoom.getIsSoloGame()).to.equals(false);
        expect(gameRoom.getGame['convertedSoloGame']).to.equals(false);
        gameRoom.convertSoloGame('id2', virtualPlayer);
        expect(gameRoom.getIsSoloGame()).to.equals(true);
        expect(gameRoom.getGame['convertedSoloGame']).to.equals(true);
        expect(gameRoom['players'][1].getName()).to.equals('Manuel');
    });
});
