/* eslint-disable dot-notation */
import { GameRoom } from '@app/classes/game-room';
import { GameSettings } from '@app/classes/game-settings';
import { Player } from '@app/classes/player';
import { Direction, ErrorType } from '@app/constants/basic-constants';
import { PossibleWords } from '@app/services/possible-word-finder.service';
import { RoomManagerService } from '@app/services/room-manager.service';
import { assert, expect } from 'chai';
import { describe } from 'mocha';
import { CommandController } from './command.controller';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');
import { WordValidation } from '@app/services/word-validation.service';

describe('CommandController', () => {
    let commandController: CommandController;
    let roomManagerService: RoomManagerService;
    let gameRoom: GameRoom;
    let player1: Player;
    let player2: Player;

    beforeEach(() => {
        roomManagerService = new RoomManagerService(undefined);
        const gameSettings: GameSettings = {
            hostPlayerName: 'HostPlayerNameTest',
            isSoloMode: false,
            timer: { minute: 1, second: 0 },
            dictionary: 'DictionaryNameTest',
            roomName: 'RoomNameTest',
            virtualPlayerName: 'VirtualPlayerNameTest',
            isEasyMode: true,
        };
        const wordValidationService: WordValidation = new WordValidation(['ma']);
        gameRoom = new GameRoom('testRoom', wordValidationService, gameSettings);
        player1 = new Player('id1', 'Joe');
        player2 = new Player('id2', 'Eve');
        gameRoom.addPlayer(player1);
        gameRoom.addPlayer(player2);
        gameRoom.getGame.startGame();
        if (player1.hasTurn()) gameRoom.getGame['swapActivePlayer']();
        roomManagerService['activeRooms']['testRoom'] = gameRoom;
        commandController = new CommandController(roomManagerService);
    });
    it('should return illegal command if the player is not in a room', () => {
        expect(commandController.executeCommand({ commandType: 'Pass', args: '', playerID: 'id3' }).errorType).to.equals(ErrorType.IllegalCommand);
    });
    it('should return illegal command if it is not the player turn', () => {
        expect(commandController.executeCommand({ commandType: 'Pass', args: '', playerID: 'id1' }).errorType).to.equals(ErrorType.IllegalCommand);
    });
    it('should return the pass message when pass is called correctly', () => {
        expect(commandController.executeCommand({ commandType: 'Pass', args: '', playerID: 'id2' }).activePlayerMessage).to.equals(
            'a passé son tour.',
        );
    });
    it('should call swapLetters if swap is called correctly', () => {
        const spy = Sinon.spy(gameRoom.getGame, 'swapLetters');
        commandController['swapLetters']('a', gameRoom.getGame);
        assert(spy.called);
    });
    it('should call swapLetters if executeCommand is called with swap', () => {
        const spy = Sinon.spy(gameRoom.getGame, 'swapLetters');
        commandController.executeCommand({ commandType: 'Swap', args: 'a', playerID: 'id2' });
        assert(spy.called);
    });
    it('should return illegal syntax with incorrect argument in swap', () => {
        expect(commandController['swapLetters']('aT', gameRoom.getGame).errorType).to.equals(ErrorType.InvalidSyntax);
    });
    it('should call placeLetters if place is called correctly', () => {
        const spy = Sinon.spy(gameRoom.getGame, 'placeLetter');
        commandController['placeLetters']('a13 a', gameRoom.getGame);
        assert(spy.called);
    });
    it('should call placeLetter if executeCommand is called with place', () => {
        const spy = Sinon.spy(gameRoom.getGame, 'placeLetter');
        commandController.executeCommand({ commandType: 'Place', args: 'a13 a', playerID: 'id2' });
        assert(spy.called);
    });
    it('should return illegal syntax with incorrect argument in place', () => {
        expect(commandController['placeLetters']('3', gameRoom.getGame).errorType).to.equals(ErrorType.InvalidSyntax);
    });
    it('should return illegal command if the command is invalid', () => {
        expect(commandController.executeCommand({ commandType: 'PasaaCW', args: '', playerID: 'id2' }).errorType).to.equals(ErrorType.IllegalCommand);
    });
    it('should return the place message when place is called correctly', () => {
        expect(commandController['placeMessage']({ activePlayerMessage: '', otherPlayerMessage: '60' }, 'a').activePlayerMessage).to.equals(
            'a placé a pour 60 point(s).',
        );
    });
    it('should return the reserve content when reserve is called correctly even if player does npt have turn', () => {
        expect(commandController.executeCommand({ commandType: 'Reserve', args: '', playerID: 'id2' }).activePlayerMessage).to.not.equals(undefined);
        expect(commandController.executeCommand({ commandType: 'Reserve', args: '', playerID: 'id2' }).otherPlayerMessage).to.equals('NotEndTurn');
        expect(commandController.executeCommand({ commandType: 'Reserve', args: '', playerID: 'id1' }).activePlayerMessage).to.not.equals(undefined);
        expect(commandController.executeCommand({ commandType: 'Reserve', args: '', playerID: 'id1' }).otherPlayerMessage).to.equals('NotEndTurn');
    });
    it('should call find words when hint is called correctly', () => {
        const spy = Sinon.spy(gameRoom.getGame, 'findWords');
        commandController.executeCommand({ commandType: 'Hint', args: '', playerID: 'id2' });
        assert(spy.called);
    });
    it('should change the array when shuffle words is called on it', () => {
        const possibleWords: PossibleWords[] = [
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 1 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 2 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 3 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 4 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 5 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 6 },
        ];
        commandController['shuffleWords'](possibleWords);
        expect(possibleWords).to.not.eql([
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 1 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 2 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 3 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 4 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 5 },
            { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 6 },
        ]);
    });
    it('should return the correct message when hintMessage is called with no word found', () => {
        expect(commandController['hintMessage']([]).activePlayerMessage).to.equals('Aucun mot possible trouvé');
        expect(commandController['hintMessage']([]).otherPlayerMessage).to.equals('NotEndTurn');
    });
    it('should return the correct message when hintMessage is called with one word found', () => {
        expect(
            commandController['hintMessage']([
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
            ]).activePlayerMessage,
        ).to.equals('Seulement un mot trouvé : \n!placer a1h elan');
        expect(
            commandController['hintMessage']([
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
            ]).otherPlayerMessage,
        ).to.equals('NotEndTurn');
    });
    it('should return the correct message when hintMessage is called with two word found', () => {
        expect(
            commandController['hintMessage']([
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
            ]).activePlayerMessage,
        ).to.equals('Seulement deux mots trouvés : \n!placer a1h elan\n!placer a1h elan');
        expect(
            commandController['hintMessage']([
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
            ]).otherPlayerMessage,
        ).to.equals('NotEndTurn');
    });
    it('should return the correct message when hintMessage is called with three word found', () => {
        expect(
            commandController['hintMessage']([
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
            ]).activePlayerMessage,
        ).to.equals('Indice : \n!placer a1h elan\n!placer a1h elan\n!placer a1h elan');
        expect(
            commandController['hintMessage']([
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
                { command: { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }, value: 0 },
            ]).otherPlayerMessage,
        ).to.equals('NotEndTurn');
    });
});
