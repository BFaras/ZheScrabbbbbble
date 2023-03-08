/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import "reflect-metadata"
import { Direction, RoomVisibility } from '@app/constants/basic-constants';
import { PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { CommandTypes } from '@app/controllers/command.controller';
import { PossibleWords } from '@app/services/possible-word-finder.service';
import { assert, expect } from 'chai';
import { describe } from 'mocha';
import { GameRoom } from './game-room';
import { Hand } from './hand';
import { Letter } from './letter';
import { Player } from './player';
import { CommandDetails, VirtualPlayer } from './virtual-player';
import { VirtualPlayerEasy } from './virtual-player-easy';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');


describe('VirtualPlayerEasy', () => {
    let virtualPlayer: VirtualPlayer;
    const name = '1';
    const dict: string[] = ['aime', 'amie', 'poly'];
    let room: GameRoom;
    let realPlayer: Player;
    const firstWordCommandinfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 7, direction: Direction.Horizontal, letters: 'a i m e' };
    const secondWordCommandinfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 8, direction: Direction.Vertical, letters: 'poly' };
    const thirdWordCommandinfo: PlaceLetterCommandInfo = { letterCoord: 10, numberCoord: 4, direction: Direction.Horizontal, letters: 'info' };
    const firstPossibleWord: PossibleWords = { command: firstWordCommandinfo, value: 8 };
    const secondPossibleWord: PossibleWords = { command: secondWordCommandinfo, value: 14 };
    const thirdPossibleword: PossibleWords = { command: thirdWordCommandinfo, value: 4 };
    const possibleWords: PossibleWords[] = [firstPossibleWord, secondPossibleWord, thirdPossibleword];
    beforeEach(() => {
        room = new GameRoom('id1', 'testRoom', RoomVisibility.Public);
        realPlayer = new Player('16783jc', 'real');
        virtualPlayer = new VirtualPlayerEasy(name, room);
        room.addPlayer(virtualPlayer);
        room.addPlayer(realPlayer);
        const letterV = new Letter('v', 2);
        const letterI = new Letter('i', 3);
        const letterE = new Letter('e', 1);
        const letterA = new Letter('a', 2);
        const letterM = new Letter('m', 1);
        const letterN = new Letter('n', 1);
        const letterT = new Letter('t', 1);
        virtualPlayer['hand'] = new Hand([letterV, letterA, letterI, letterT, letterM, letterE, letterN]);
        room.getGame['playerTurnIndex'] = 0;
        room.getGame['wordValidationService']['dictionary'] = dict;
    });
    it('getRange should return a tuple of number ', () => {
        const range = virtualPlayer['getRange']();
        expect(range[0]).to.be.a('number');
        expect(range[1]).to.be.a('number');
    });
    it('getAction should return a valid CommandType ', () => {
        const action = virtualPlayer['getAction']();
        const possibleAction = [CommandTypes.Swap, CommandTypes.Place, CommandTypes.Pass];
        expect(possibleAction).to.includes(action);
    });
    it('getValidWord should return a possible word ', () => {
        expect(possibleWords).to.include(virtualPlayer['getValidWord'](possibleWords));
    });
    it('place should return the right type of result', () => {
        const commandDetails = virtualPlayer['place']();
        expect(commandDetails.result.activePlayerMessage).to.be.a('string');
        expect(commandDetails.result.otherPlayerMessage).to.be.a('string');
    });
    it('getValidWord should return the valid word in the appropriate range ', () => {
        expect(virtualPlayer['getValidWordFromRange'](possibleWords, [0, 6])).to.equal(thirdPossibleword);
    });
    it('getValidWord should return the closest word there is not a word in the range ', () => {
        expect(virtualPlayer['getValidWordFromRange'](possibleWords, [9, 10])).to.equal(firstPossibleWord);
    });
    it('order should return the right difference', () => {
        expect(virtualPlayer['order'](firstPossibleWord, [0, 6])).to.equal(2);
    });
    it('Play should return a commandDetails', () => {
        const commandDetails: CommandDetails = virtualPlayer.play();
        expect(commandDetails.result.activePlayerMessage).to.be.a('string');
        expect(commandDetails.result.otherPlayerMessage).to.be.a('string');
    });
    it('Swap should return a CommandResult', () => {
        const commandDetails: CommandDetails = virtualPlayer['swap']();
        expect(commandDetails.result.activePlayerMessage).to.be.a('string');
        expect(commandDetails.result.otherPlayerMessage).to.be.a('string');
    });
    it('getTheClosest should return the closest word ', () => {
        const result: PossibleWords = virtualPlayer['getTheClosest'](possibleWords, [10, 13]);
        expect(result).to.equal(secondPossibleWord);
    });
    it('getRangeFromRandom should return the right range', () => {
        expect(virtualPlayer['getRangeFromRandom'](0.2)).to.eql([1, 6]);
    });
    it('getRangeFromRandom should return the right range', () => {
        expect(virtualPlayer['getRangeFromRandom'](0.5)).to.eql([7, 12]);
    });
    it('getRangeFromRandom should return the right range', () => {
        expect(virtualPlayer['getRangeFromRandom'](0.8)).to.eql([13, 18]);
    });

    it('getActionFromRandom should return the right action', () => {
        expect(virtualPlayer['getActionFromRandom'](0.6)).to.equal(CommandTypes.Place);
    });
    it('getActionFromRandom should return the right action', () => {
        expect(virtualPlayer['getActionFromRandom'](0.1)).to.equal(CommandTypes.Swap);
    });
    it('getActionFromRandom should return the right action', () => {
        expect(virtualPlayer['getActionFromRandom'](0.9)).to.equal(CommandTypes.Pass);
    });
    it('getValidword should passTurn if there is no possibleWord ', () => {
        const spy = Sinon.spy(room.getGame, 'passTurn');
        virtualPlayer['hand'] = new Hand([new Letter('t', 1)]);
        virtualPlayer['playAction'](CommandTypes.Place);
        assert(spy.called);
    });
    it('playAction should call the right command', () => {
        const spy = Sinon.spy(room.getGame, 'passTurn');
        virtualPlayer['playAction'](CommandTypes.Pass);
        assert(spy.called);
    });
    it('playAction should call the right command', () => {
        const spy = Sinon.spy(room.getGame, 'swapLetters');
        virtualPlayer['playAction'](CommandTypes.Swap);
        assert(spy.called);
    });
    it('playAction should call the right command', () => {
        const spy = Sinon.spy(room.getGame, 'placeLetter');
        virtualPlayer['playAction'](CommandTypes.Place);
        assert(spy.called);
    });
});
