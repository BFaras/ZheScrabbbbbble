/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { Hand } from '@app/classes/hand';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { Direction, ErrorType } from '@app/constants/basic-constants';
import { GameState, PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { WordValidation } from '@app/services/word-validation.service';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { Game } from './game';

describe('GameService', () => {
    let gameService: Game;
    let player1: Player;
    let player2: Player;
    let players: Player[];

    beforeEach(() => {
        player1 = new Player('id1', 'Joe');
        player2 = new Player('id2', 'Eve');
        players = [player1, player2];
        gameService = new Game(new WordValidation(['ma']) as WordValidation, players);
    });

    it('should return correct player if getPlayerTurn is called', () => {
        player1['playerHasTurn'] = false;
        player2['playerHasTurn'] = true;
        player1['hand'] = new Hand([new Letter('a', 0)]);
        player2['hand'] = new Hand([new Letter('b', 0)]);
        expect(gameService['getPlayerTurn']()).to.not.eql(player1);
        expect(gameService['getPlayerTurn']()).to.eql(player2);
    });

    it('should return a gameState with the correct values when createGameState is called', () => {
        player1['playerHasTurn'] = false;
        player2['playerHasTurn'] = true;
        player1['hand'] = new Hand([new Letter('a', 0)]);
        player2['hand'] = new Hand([new Letter('b', 0)]);
        gameService['boardWithInvalidWord'] = [['a']];
        const gameState: GameState = gameService.createGameState(1);
        expect(gameState.yourScore).to.equals(0);
        expect(gameState.opponentScore).to.equals(0);
        expect(gameState.hand).to.eql(['b']);
        expect(gameState.isYourTurn).to.equals(true);
        expect(gameState.opponentHandLength).to.equals(1);
        expect(gameState.boardWithInvalidWords).to.eql([['a']]);
    });
    it('should subtract the value in hand from the score and add it to the opponent score when scorePlayer is called when a hand is empty', () => {
        player1['hand'] = new Hand([new Letter('a', 15)]);
        player2['hand'] = new Hand([]);
        player1.addScore(50);
        player2.addScore(50);
        gameService['scorePlayer'](0);
        gameService['scorePlayer'](1);
        expect(player1.getScore()).to.equals(35);
        expect(player2.getScore()).to.equals(65);
    });
    it('should return the endMessage with each player remaining letters when endGame is called', () => {
        player1['hand'] = new Hand([new Letter('a', 15)]);
        player2['hand'] = new Hand([]);
        expect(gameService['endGame']()).to.equals('Fin de partie - lettres restantes \nJoe : a\nEve : ');
        expect(gameService['isGameOver']()).to.equals(true);
    });
    it('should have the correct parameters when startGame is called', () => {
        gameService.startGame();
        expect(gameService['players'][0].getHand().getLength()).to.equals(7);
        expect(gameService['players'][1].getHand().getLength()).to.equals(7);
    });
    it('should return an illegalCommand when placeLetter is called with incorrect parameters', () => {
        gameService.startGame();
        const placeLetterCommandInfo: PlaceLetterCommandInfo = { letterCoord: -1, numberCoord: 0, direction: Direction.Horizontal, letters: '' };
        expect(gameService.placeLetter(placeLetterCommandInfo).errorType).to.equals(ErrorType.IllegalCommand);
    });
    it('should return an illegal placement message when placeLetter is called with letters that do not make a word', () => {
        gameService['players'][0].swapTurn();
        gameService['players'][0]['hand'] = new Hand([new Letter('a', 15), new Letter('l', 15), new Letter('a', 15)]);
        const placeLetterCommandInfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 7, direction: Direction.Horizontal, letters: 'aa' };
        expect(gameService.placeLetter(placeLetterCommandInfo).activePlayerMessage).to.equals('a tenté de placer un mot invalide.');
    });
    it('should return an endGame message when placeLetter is called with letters that make a word and trigger the end conditions', () => {
        gameService['players'][0].swapTurn();
        gameService['reserve'].drawLetters(105);
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5)]);
        const placeLetterCommandInfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 7, direction: Direction.Horizontal, letters: 'ma' };
        expect(gameService.placeLetter(placeLetterCommandInfo).endGameMessage).to.not.equals(undefined);
    });
    it('should return an empty message when placeLetter is called with letters that make a word', () => {
        gameService['players'][0].swapTurn();
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5), new Letter('a', 1)]);
        const placeLetterCommandInfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 7, direction: Direction.Vertical, letters: 'ma' };
        expect(gameService.placeLetter(placeLetterCommandInfo).activePlayerMessage).to.equals('');
    });
    it('should return an error when swapLetter is called with an empty reserve', () => {
        gameService['players'][0].swapTurn();
        gameService['reserve'].drawLetters(105);
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5), new Letter('a', 1)]);
        expect(gameService.swapLetters('ma').errorType).to.equals(ErrorType.IllegalCommand);
    });
    it('should return an error when swapLetter is called with unowned letters', () => {
        gameService['players'][0].swapTurn();
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5), new Letter('a', 1)]);
        expect(gameService.swapLetters('mkdf').errorType).to.equals(ErrorType.IllegalCommand);
    });
    it('should return an error when swapLetter is called with unowned letters', () => {
        gameService['players'][0].swapTurn();
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5), new Letter('a', 1)]);
        expect(gameService.swapLetters('ma').activePlayerMessage).to.equals('a échangé les lettres ma.');
    });
    it('should return an end message when passTurn is called for a sixth consecutive turn', () => {
        gameService['players'][0].swapTurn();
        gameService['incrementCounter']();
        gameService['incrementCounter']();
        gameService['incrementCounter']();
        gameService['incrementCounter']();
        gameService['incrementCounter']();
        expect(gameService.passTurn().endGameMessage).to.not.equals(undefined);
    });
    it('should return a pass message when passTurn is called', () => {
        gameService['players'][0].swapTurn();
        expect(gameService.passTurn().activePlayerMessage).to.equals('a passé son tour.');
    });
    it('should verify the function getReservContent of the reserve is called when the one in gameRoom is called', () => {
        const spy = sinon.spy(gameService['reserve'], 'getReserveContent');
        gameService.getReserveContent();
        assert(spy.called);
    });

    it('should create game history when calling create game history', () => {
        const gameHistory = gameService.createGameHistory(0);
        expect(gameHistory).ownProperty('date');
        expect(gameHistory).ownProperty('time');
        expect(gameHistory).ownProperty('length');
        expect(gameHistory).ownProperty('player1');
        expect(gameHistory).ownProperty('player2');
        expect(gameHistory).ownProperty('mode');
    });
});
