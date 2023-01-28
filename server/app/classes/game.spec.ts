/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { Hand } from '@app/classes/hand';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { Direction, ErrorType, GameType } from '@app/constants/basic-constants';
import { GameState, PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { FIVE_ROUND, Goal, SWAP_FIFTEEN_LETTERS } from '@app/constants/goal-constants';
import { GoalsValidation } from '@app/services/goals-validation.service';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { Game } from './game';

describe('GameService', () => {
    let gameService: Game;
    let player1: Player;
    let player2: Player;
    let players: Player[];
    let gameType: GameType;
    let goal: Goal;
    const fiveRound: Goal = {
        title: FIVE_ROUND.title,
        points: FIVE_ROUND.points,
        completed: FIVE_ROUND.completed,
        progress: FIVE_ROUND.progress,
        progressMax: FIVE_ROUND.progressMax,
    };

    beforeEach(() => {
        goal = {
            title: SWAP_FIFTEEN_LETTERS.title,
            points: SWAP_FIFTEEN_LETTERS.points,
            completed: SWAP_FIFTEEN_LETTERS.completed,
            progress: SWAP_FIFTEEN_LETTERS.progress,
            progressMax: SWAP_FIFTEEN_LETTERS.progressMax,
        };
        player1 = new Player('id1', 'Joe');
        player2 = new Player('id2', 'Eve');
        players = [player1, player2];
        gameType = GameType.CLASSIC;
        gameService = new Game(new GoalsValidation(['ma']) as GoalsValidation, players, gameType);
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
    it('StartGame should give 3 goals to each player ', () => {
        gameService['gameType'] = GameType.LOG2990;
        gameService.startGame();
        expect(gameService['players'][0].getGoals()?.length === 3).to.equals(true);
    });
    it('goalsCreation should give 3 goals to each player ', () => {
        gameService['gameType'] = GameType.LOG2990;
        gameService['goalsCreation']();
        expect(gameService['players'][0].getGoals()?.length === 3).to.equals(true);
    });

    it('swapFifteenLetters should increment the number of swap of players', () => {
        const oldNumberOfSwap = gameService['getPlayerTurn']().getNumberOfSwap();
        gameService['swapFifteenLetters'](goal, 1);
        const newNumberOfSwap = gameService['getPlayerTurn']().getNumberOfSwap();
        expect(newNumberOfSwap - oldNumberOfSwap).equals(1);
    });

    it('swapFifteenLetters should add the score of the player and complete the goal when accomplish', () => {
        gameService['getPlayerTurn']().setGoals([goal]);
        const oldScore = gameService['getPlayerTurn']().getScore();
        gameService['getPlayerTurn']()['numberOfSwap'] = 14;
        gameService['swapFifteenLetters'](goal, 1);
        const newScore = gameService['getPlayerTurn']().getScore();

        expect(newScore - oldScore).equals(SWAP_FIFTEEN_LETTERS.points);
    });
    it('swapLetters should  increment the number of swap of players', () => {
        gameService.startGame();
        gameService['gameType'] = GameType.LOG2990;
        gameService['getPlayerTurn']().setGoals([goal]);
        const oldNumberOfSwap = gameService['getPlayerTurn']().getNumberOfSwap();
        gameService.swapLetters(gameService['getPlayerTurn']().getHand().getLettersToString()[0]);
        const newNumberOfSwap = gameService['getPlayerNotTurn']().getNumberOfSwap();

        expect(newNumberOfSwap - oldNumberOfSwap).equals(1);
    });

    it('swapLetter should call resetNumberOfPlacementSucc', () => {
        gameService.startGame();
        gameService['getPlayerTurn']().setGoals([FIVE_ROUND]);
        const spy = sinon.spy(Player.prototype, 'resetNumberOfPlacementSucc');
        gameService.swapLetters(gameService['getPlayerTurn']().getHand().getLettersToString()[0]);
        assert(spy.called);
        spy.restore();
    });
    it('passTurn should call resetNumberOfPlacementSucc', () => {
        gameService['gameType'] = GameType.LOG2990;
        gameService['getPlayerTurn']().setGoals([FIVE_ROUND]);
        const spy = sinon.spy(Player.prototype, 'resetNumberOfPlacementSucc');
        gameService.passTurn();
        assert(spy.called);
    });
    it(' placeLetter should call goalValidation ', () => {
        const spy = sinon.spy(gameService['wordValidationService'], 'goalValidation');
        gameService['players'][0].swapTurn();
        gameService['gameType'] = GameType.LOG2990;
        gameService['getPlayerTurn']().setGoals([FIVE_ROUND]);
        gameService['players'][0]['hand'].addLetters([new Letter('i', 1), new Letter('l', 5)]);
        const placeLetterCommandInfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 7, direction: Direction.Vertical, letters: 'il' };
        gameService.placeLetter(placeLetterCommandInfo);
        assert(spy.called);
    });

    it(' checkForFiveRounds should call fiveRound ', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = sinon.spy(Game.prototype, 'fiveRounds' as any);
        gameService['getPlayerTurn']().setGoals([fiveRound]);
        gameService['checkForFiveRounds']();
        assert(spy.called);
    });
    it(' checkForFiveRounds should complete the goals when accomplish ', () => {
        gameService['getPlayerTurn']()['numberOfPlacementSucc'] = 4;
        gameService['getPlayerTurn']().setGoals([fiveRound]);
        gameService['checkForFiveRounds']();
        expect(fiveRound.completed).equals(true);
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
