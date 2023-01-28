import { Board } from '@app/classes/board';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { Reserve } from '@app/classes/reserve';
import {
    CONSECUTIVE_ROUND_PLAY_GOAL,
    DECIMAL_BASE,
    ErrorType,
    GameType,
    HAND_SIZE,
    MILLISECOND_IN_HOURS,
    MILLISECOND_IN_MINUTES,
    MILLISECOND_IN_SECONDS,
    NUMBER_LETTER_SWAP_GOAL,
    NUMBER_PASS_ENDING_GAME,
    SHUFFLING_CONSTANT,
    TIME_BASE,
    TOTAL_NUMBER_GOALS,
} from '@app/constants/basic-constants';
import { GameState, PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { GameHistory, PlayerInfo, VirtualPlayerDifficulty } from '@app/constants/database-interfaces';
import { FIVE_ROUND, Goal, GOALS, SWAP_FIFTEEN_LETTERS } from '@app/constants/goal-constants';
import { CommandResult } from '@app/controllers/command.controller';
import { CommandFormattingService } from '@app/services/command-formatting.service';
import { GoalsValidation } from '@app/services/goals-validation.service';
import { PossibleWordFinder, PossibleWords } from '@app/services/possible-word-finder.service';
import { VirtualPlayer } from './virtual-player';
import { VirtualPlayerHard } from './virtual-player-hard';

export class Game {
    private passCounter: number;
    private board: Board;
    private boardWithInvalidWord: string[][] | undefined;
    private wordValidationService: GoalsValidation;
    private players: Player[];
    private reserve: Reserve;
    private gameOver: boolean;
    private startDate: Date;
    private gameType: GameType;
    private convertedSoloGame: boolean;

    constructor(wordValidation: GoalsValidation, players: Player[], gameType: GameType) {
        this.passCounter = 0;
        this.reserve = new Reserve();
        this.board = new Board();
        this.gameOver = false;
        this.players = players;
        this.wordValidationService = wordValidation;
        this.gameType = gameType;
        this.convertedSoloGame = false;
    }
    startGame() {
        if (this.players.length === 2) {
            this.players[Math.floor(Math.random() * this.players.length)].swapTurn();
            this.players[0].getHand().addLetters(this.reserve.drawLetters(HAND_SIZE));
            this.players[1].getHand().addLetters(this.reserve.drawLetters(HAND_SIZE));
            this.startDate = new Date();
            if (this.gameType === GameType.LOG2990) {
                this.goalsCreation();
            }
        }
    }
    placeLetter(commandInfo: PlaceLetterCommandInfo): CommandResult {
        const playerHand = this.getPlayerTurn().getHand();
        const letters = playerHand.getLetters(commandInfo.letters, true);
        const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(commandInfo, this.board, letters);
        if (!formattedCommand) {
            playerHand.addLetters(letters as Letter[]);
            return { errorType: ErrorType.IllegalCommand };
        }
        const score =
            this.gameType === GameType.LOG2990
                ? this.wordValidationService.goalValidation(formattedCommand, this.board, true, this.getPlayerTurn().getGoals())
                : this.wordValidationService.validation(formattedCommand, this.board, true);
        this.resetCounter();
        if (score < 0) {
            const invalidWordPlayerMessage = 'a tenté de placer un mot invalide.';
            this.boardWithInvalidWord = this.board.toStringArray();
            this.board.removeLetters(formattedCommand);
            playerHand.addLetters(letters as Letter[]);
            if (
                this.getPlayerTurn()
                    .getGoals()
                    ?.find((goal) => goal.title === FIVE_ROUND.title && goal.completed === false)
            )
                this.getPlayerTurn().resetNumberOfPlacementSucc();
            this.endTurn();
            return { activePlayerMessage: invalidWordPlayerMessage, otherPlayerMessage: invalidWordPlayerMessage };
        }
        this.boardWithInvalidWord = undefined;
        this.getPlayerTurn().addScore(score);
        this.checkForFiveRounds();
        const endMessage = this.endTurn();
        if (endMessage) {
            return { endGameMessage: endMessage };
        }
        playerHand.addLetters(this.reserve.drawLetters(HAND_SIZE - playerHand.getLength()));

        return { activePlayerMessage: '', otherPlayerMessage: `${score}` };
    }

    swapLetters(stringLetters: string): CommandResult {
        if (!this.reserve.canSwap() || this.reserve.getLength() < stringLetters.length) return { errorType: ErrorType.IllegalCommand };
        const activeHand = this.getPlayerTurn().getHand();
        const letters = activeHand.getLetters(stringLetters, true);
        if (!letters) return { errorType: ErrorType.IllegalCommand };
        activeHand.addLetters(this.reserve.drawLetters(HAND_SIZE - activeHand.getLength()));
        this.swapLettersGoalsTreatment(stringLetters.length);
        this.reserve.returnLetters(letters);
        this.resetCounter();
        this.endTurn();
        this.boardWithInvalidWord = undefined;
        const activePlayerMessage = `a échangé les lettres ${stringLetters}.`;
        const otherPlayerMessage = `a échangé ${stringLetters.length} lettres.`;
        return { activePlayerMessage, otherPlayerMessage };
    }

    passTurn(): CommandResult {
        this.incrementCounter();
        this.boardWithInvalidWord = undefined;
        if (
            this.getPlayerTurn()
                .getGoals()
                ?.find((goal) => goal.title === FIVE_ROUND.title && goal.completed === false)
        )
            this.getPlayerTurn().resetNumberOfPlacementSucc();
        const endMessage = this.endTurn();
        if (endMessage) {
            return { endGameMessage: endMessage };
        }
        const returnMessage = 'a passé son tour.';
        return { activePlayerMessage: returnMessage, otherPlayerMessage: returnMessage };
    }
    endGame(): string {
        this.gameOver = true;
        this.scorePlayer(0);
        this.scorePlayer(1);
        const endMessage: string =
            'Fin de partie - lettres restantes \n' +
            this.players[0].getName() +
            ' : ' +
            this.players[0].getHand().getLettersToString() +
            '\n' +
            this.players[1].getName() +
            ' : ' +
            this.players[1].getHand().getLettersToString();
        return endMessage;
    }

    createGameHistory(winnerIndex: number): GameHistory {
        const gameHistory: GameHistory = {
            date: this.getFormattedDate(),
            time: this.getFormattedStartTime(),
            length: this.getFormattedDuration(),
            player1: this.getPlayerInfo(0, winnerIndex),
            player2: this.getPlayerInfo(1, winnerIndex),
            mode: this.gameType,
        };
        if (gameHistory.player1.virtual || gameHistory.player2.virtual) gameHistory.abandoned = this.isConvertedSoloGame;
        return gameHistory;
    }

    createGameState(playerNumber: number): GameState {
        const opponentNumber = playerNumber === 0 ? 1 : 0;
        const player = this.players[playerNumber];
        const opponent = this.players[opponentNumber];
        const gameState: GameState = {
            board: this.board.toStringArray(),
            hand: player.getHand().getLettersToString(),
            opponentHandLength: opponent.getHand().getLength(),
            isYourTurn: player.hasTurn(),
            yourScore: player.getScore(),
            opponentScore: opponent.getScore(),
            reserveLength: this.reserve.getLength(),
            gameOver: this.gameOver,
            yourGoals: player.getGoals(),
            oppenentGoals: opponent.getGoals(),
        };
        if (this.boardWithInvalidWord) {
            gameState.boardWithInvalidWords = this.boardWithInvalidWord;
        }
        return gameState;
    }
    swapActivePlayer() {
        this.players[0].swapTurn();
        this.players[1].swapTurn();
    }
    findWords(virtualPlay: boolean): PossibleWords[] {
        return PossibleWordFinder.findWords(
            { hand: this.getPlayerTurn()?.getHand(), wordValidation: this.wordValidationService, board: this.board },
            virtualPlay,
        );
    }
    getReserveContent(): string {
        return this.reserve.getReserveContent();
    }
    getGameType(): GameType {
        return this.gameType;
    }

    isGameOver(): boolean {
        return this.gameOver;
    }
    getReserveLength(): number {
        return this.reserve.getLength();
    }

    convertSoloGame() {
        this.convertedSoloGame = true;
    }
    private swapLettersGoalsTreatment(stringLettersLength: number) {
        const swapFifteen = this.getPlayerTurn()
            .getGoals()
            ?.find((goal) => goal.title === SWAP_FIFTEEN_LETTERS.title && goal.completed === false);
        if (swapFifteen) {
            this.swapFifteenLetters(swapFifteen, stringLettersLength);
        }
        if (this.getPlayerTurn().getGoals()?.includes(FIVE_ROUND)) this.getPlayerTurn().resetNumberOfPlacementSucc();
    }
    private checkForFiveRounds() {
        const fiveRoundsGoal = this.getPlayerTurn()
            .getGoals()
            ?.find((goal) => goal.title === FIVE_ROUND.title && goal.completed === false);

        if (fiveRoundsGoal) this.fiveRounds(fiveRoundsGoal);
    }
    private goalsCreation() {
        const shuffled: Goal[] = GOALS.sort(() => SHUFFLING_CONSTANT - Math.random());
        const selected = shuffled.slice(0, TOTAL_NUMBER_GOALS);
        const goalList: Goal[] = [];
        for (const goal of selected) {
            const newGoal: Goal = {
                title: goal.title,
                points: goal.points,
                completed: goal.completed,
                progress: goal.progress,
                progressMax: goal.progressMax,
            };
            goalList.push(newGoal);
        }
        this.players[0].setGoals([goalList[0], goalList[1], goalList[2]]);
        this.players[1].setGoals([goalList[0], goalList[1], goalList[3]]);
    }

    private swapFifteenLetters(goal: Goal, letterLength: number) {
        this.getPlayerTurn().addNumberOfSwap(letterLength);
        goal.progress = [
            { playerName: this.players[0].getName(), playerProgress: this.players[0].getNumberOfSwap() },
            { playerName: this.players[1].getName(), playerProgress: this.players[1].getNumberOfSwap() },
        ];
        if (this.getPlayerTurn().getNumberOfSwap() >= NUMBER_LETTER_SWAP_GOAL) {
            this.getPlayerTurn().addScore(SWAP_FIFTEEN_LETTERS.points);
            goal.completed = true;
        }
    }

    private scorePlayer(playerNumber: number) {
        const player = this.players[playerNumber];
        if (!player) return;
        if (player?.getHand().calculateHandScore() === 0) player.addScore(this.players[playerNumber === 0 ? 1 : 0]?.getHand().calculateHandScore());
        player.addScore(-player?.getHand().calculateHandScore());
    }

    private endTurn(): string {
        let returnMessage = '';
        this.swapActivePlayer();
        if (this.isGameFinished()) {
            returnMessage = this.endGame();
        }
        return returnMessage;
    }
    private isGameFinished(): boolean {
        return this.passCounter === NUMBER_PASS_ENDING_GAME || (this.getPlayerNotTurn().getHand().getLength() === 0 && this.getReserveLength() === 0);
    }

    private getPlayerTurn(): Player {
        return this.players[0].hasTurn() ? this.players[0] : this.players[1];
    }
    private getPlayerNotTurn(): Player {
        return this.players[1].hasTurn() ? this.players[0] : this.players[1];
    }

    private resetCounter() {
        this.passCounter = 0;
    }
    private incrementCounter() {
        this.passCounter++;
    }

    private getFormattedStartTime(): string {
        const minutes = this.startDate?.getMinutes();
        const hours = this.startDate?.getHours();
        return `${hours}h${minutes < DECIMAL_BASE ? '0' : ''}${minutes}`;
    }

    private getFormattedDuration(): string {
        const gameDuration = Date.now() - this.startDate?.getTime();
        const seconds = Math.floor((gameDuration / MILLISECOND_IN_SECONDS) % TIME_BASE);
        const minutes = Math.floor((gameDuration / MILLISECOND_IN_MINUTES) % TIME_BASE);
        const hours = Math.floor(gameDuration / MILLISECOND_IN_HOURS);
        return `${hours}:${minutes < DECIMAL_BASE ? '0' : ''}${minutes}:${seconds < DECIMAL_BASE ? '0' : ''}${seconds}`;
    }

    private getFormattedDate(): string {
        const day = this.startDate?.getDate();
        const month = this.startDate?.getMonth() + 1;
        const year = this.startDate?.getFullYear();
        return `${day < DECIMAL_BASE ? '0' : ''}${day}/${month < DECIMAL_BASE ? '0' : ''}${month}/${year}`;
    }

    private getPlayerInfo(index: number, winnerIndex: number): PlayerInfo {
        const player: PlayerInfo = {
            name: this.players[index].getName(),
            score: this.players[index].getScore(),
            virtual: this.players[index] instanceof VirtualPlayer,
            winner: winnerIndex === index,
        };
        if (player.virtual)
            player.difficulty = this.players[index] instanceof VirtualPlayerHard ? VirtualPlayerDifficulty.EXPERT : VirtualPlayerDifficulty.BEGINNER;
        return player;
    }

    private fiveRounds(goal: Goal) {
        this.getPlayerTurn().incrementNumberOfPlacementSucc();
        goal.progress = [
            { playerName: this.players[0].getName(), playerProgress: this.players[0].getNumberOfPlacementSucc() },
            { playerName: this.players[1].getName(), playerProgress: this.players[1].getNumberOfPlacementSucc() },
        ];
        if (this.getPlayerTurn().getNumberOfPlacementSucc() === CONSECUTIVE_ROUND_PLAY_GOAL) {
            goal.completed = true;
            this.getPlayerTurn().addScore(FIVE_ROUND.points);
        }
    }
    get isConvertedSoloGame(): boolean {
        return this.convertedSoloGame;
    }
}
