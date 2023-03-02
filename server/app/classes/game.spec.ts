/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import "reflect-metadata"
import { Hand } from '@app/classes/hand';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { GameState, PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { assert, expect } from 'chai';
import { Game } from './game';
import { ILLEGAL_COMMAND } from "@app/constants/error-code-constants";
import { Direction } from "@app/constants/basic-constants";
import sinon = require("sinon");

describe('GameService', () => {
    let gameService: Game;
    let player1: Player;
    let player2: Player;
    let player3: Player;
    let player4: Player;
    let players: Player[];

    beforeEach(() => {
        player1 = new Player('id1', 'Joe');
        player2 = new Player('id2', 'Eve');
        player3 = new Player('id3', 'Bob');
        player4 = new Player('id4', 'Zoe');
        players = [player1, player2, player3, player4];
        gameService = new Game(players);
    });

    it('should return a gameState with the correct values when createGameState is called', () => {
        player1['hand'] = new Hand([new Letter('a', 0)]);
        player2['hand'] = new Hand([new Letter('b', 0)]);
        player3['hand'] = new Hand([new Letter('c', 0)]);
        player4['hand'] = new Hand([new Letter('d', 0)]);
        gameService['playerTurnIndex'] = 0;
        const expectedPlayerStates = [
            {
                username:'Joe',
                hand: ['a'],
                score: 0,
            },
            {
                username:'Eve',
                hand: ['b'],
                score: 0,
            },
            {
                username:'Bob',
                hand: ['c'],
                score: 0,
            },
            {
                username:'Zoe',
                hand: ['d'],
                score: 0,
            },
        ];
        const expectedBoardState = []
        for(let i = 0; i < 15; i++){
            const letters = [];
            for(let j = 0; j < 15; j++){
                letters.push('');
            }
            expectedBoardState.push(letters);
        }
        const gameState: GameState = gameService.createGameState();
        expect(gameState.board).to.eql(expectedBoardState);
        expect(gameState.players).to.eql(expectedPlayerStates);
        expect(gameState.playerTurnIndex).to.equals(0);
        expect(gameState.reserveLength).to.equals(102);
        expect(gameState.gameOver).to.equals(false);
    });
    
    it('should subtract the value in hand from the score and add it to the opponent score when scorePlayer is called when a hand is empty', () => {
        player1['hand'] = new Hand([new Letter('a', 15)]);
        player2['hand'] = new Hand([new Letter('a', 15)]);
        player3['hand'] = new Hand([new Letter('a', 15)]);
        player4['hand'] = new Hand([]);
        player1.addScore(50);
        player2.addScore(50);
        player3.addScore(50);
        player4.addScore(50);
        gameService['scorePlayers']();
        expect(player1.getScore()).to.equals(35);
        expect(player2.getScore()).to.equals(35);
        expect(player3.getScore()).to.equals(35);
        expect(player4.getScore()).to.equals(95);
    });
    
    it('should return the endMessage with each player remaining letters when endGame is called', () => {
        player1['hand'] = new Hand([new Letter('a', 15)]);
        player2['hand'] = new Hand([new Letter('b', 15)]);
        player3['hand'] = new Hand([new Letter('c', 15)]);
        player4['hand'] = new Hand([]);
        expect(gameService.endGame()).to.equals('Fin de partie - lettres restantes\nJoe : a\nEve : b\nBob : c\nZoe : ');
        expect(gameService.isGameOver()).to.equals(true);
    });
    
    it('should have the correct parameters when startGame is called', () => {
        gameService.startGame();
        expect(gameService['players'][0].getHand().getLength()).to.equals(7);
        expect(gameService['players'][1].getHand().getLength()).to.equals(7);
        expect(gameService['players'][2].getHand().getLength()).to.equals(7);
        expect(gameService['players'][3].getHand().getLength()).to.equals(7);
    });
    
    it('should return an illegalCommand when placeLetter is called with incorrect parameters', () => {
        gameService.startGame();
        const placeLetterCommandInfo: PlaceLetterCommandInfo = { letterCoord: -1, numberCoord: 0, direction: Direction.Horizontal, letters: '' };
        expect(gameService.placeLetter(placeLetterCommandInfo).errorType).to.equals(ILLEGAL_COMMAND);
    });
    
    it('should return an illegal placement message when placeLetter is called with letters that do not make a word', () => {
        gameService['playerTurnIndex'] = 0;
        gameService['players'][0]['hand'] = new Hand([new Letter('a', 15), new Letter('l', 15), new Letter('b', 15)]);
        const placeLetterCommandInfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 7, direction: Direction.Horizontal, letters: 'ab' };
        expect(gameService.placeLetter(placeLetterCommandInfo).activePlayerMessage).to.equals('a tenté de placer un mot invalide.');
    });
    
    it('should return an endGame message when placeLetter is called with letters that make a word and trigger the end conditions', () => {
        gameService['playerTurnIndex'] = 0;
        gameService['reserve'].drawLetters(105);
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5)]);
        const placeLetterCommandInfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 7, direction: Direction.Horizontal, letters: 'ma' };
        expect(gameService.placeLetter(placeLetterCommandInfo).endGameMessage).to.not.equals(undefined);
    });
    
    it('should return an empty message when placeLetter is called with letters that make a word', () => {
        gameService['playerTurnIndex'] = 0;
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5), new Letter('a', 1)]);
        const placeLetterCommandInfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 7, direction: Direction.Vertical, letters: 'ma' };
        expect(gameService.placeLetter(placeLetterCommandInfo).activePlayerMessage).to.equals('');
    });
    
    it('should return an error when swapLetter is called with an empty reserve', () => {
        gameService['playerTurnIndex'] = 0;
        gameService['reserve'].drawLetters(105);
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5), new Letter('a', 1)]);
        expect(gameService.swapLetters('ma').errorType).to.equals(ILLEGAL_COMMAND);
    });

    it('should return an error when swapLetter is called with unowned letters', () => {
        gameService['playerTurnIndex'] = 0;
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5), new Letter('a', 1)]);
        expect(gameService.swapLetters('mkdf').errorType).to.equals(ILLEGAL_COMMAND);
    });
    
    it('should return an error when swapLetter is called with unowned letters', () => {
        gameService['playerTurnIndex'] = 0;
        gameService['players'][0]['hand'].addLetters([new Letter('a', 1), new Letter('m', 5), new Letter('a', 1)]);
        expect(gameService.swapLetters('ma').activePlayerMessage).to.equals('a échangé les lettres ma.');
    });
    
    it('should return an end message when passTurn is called for a sixth consecutive turn', () => {
        gameService['playerTurnIndex'] = 0;
        gameService['incrementCounter']();
        gameService['incrementCounter']();
        gameService['incrementCounter']();
        gameService['incrementCounter']();
        gameService['incrementCounter']();
        expect(gameService.passTurn().endGameMessage).to.not.equals(undefined);
    });
    
    it('should return a pass message when passTurn is called', () => {
        gameService['playerTurnIndex'] = 0;
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
        expect(gameHistory).ownProperty('players');
        expect(gameHistory.players.length).to.equals(4);
        expect(gameHistory).ownProperty('winnerIndex');
    });

    it('should return the if it is a player turn when calling is player isPlayerTurn', () => {
        gameService['playerTurnIndex'] = 0;
        expect(gameService.isPlayerTurn('id1')).to.equals(true);
        expect(gameService.isPlayerTurn('id2')).to.equals(false);
        expect(gameService.isPlayerTurn('id3')).to.equals(false);
        expect(gameService.isPlayerTurn('id4')).to.equals(false);
        gameService.changeTurn();
        expect(gameService.isPlayerTurn('id1')).to.equals(false);
        expect(gameService.isPlayerTurn('id2')).to.equals(true);
        expect(gameService.isPlayerTurn('id3')).to.equals(false);
        expect(gameService.isPlayerTurn('id4')).to.equals(false);
        gameService.changeTurn();
        expect(gameService.isPlayerTurn('id1')).to.equals(false);
        expect(gameService.isPlayerTurn('id2')).to.equals(false);
        expect(gameService.isPlayerTurn('id3')).to.equals(true);
        expect(gameService.isPlayerTurn('id4')).to.equals(false);
        gameService.changeTurn();
        expect(gameService.isPlayerTurn('id1')).to.equals(false);
        expect(gameService.isPlayerTurn('id2')).to.equals(false);
        expect(gameService.isPlayerTurn('id3')).to.equals(false);
        expect(gameService.isPlayerTurn('id4')).to.equals(true);
        gameService.changeTurn();
        expect(gameService.isPlayerTurn('id1')).to.equals(true);
        expect(gameService.isPlayerTurn('id2')).to.equals(false);
        expect(gameService.isPlayerTurn('id3')).to.equals(false);
        expect(gameService.isPlayerTurn('id4')).to.equals(false);
    });
});
