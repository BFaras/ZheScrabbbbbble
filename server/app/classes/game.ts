import { Board } from '@app/classes/board';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { Reserve } from '@app/classes/reserve';
import {
    DECIMAL_BASE,
    HAND_SIZE,
    MILLISECOND_IN_HOURS,
    MILLISECOND_IN_MINUTES,
    MILLISECOND_IN_SECONDS,
    NUMBER_PASS_ENDING_GAME,
    TIME_BASE
} from '@app/constants/basic-constants';
import { GameState, PlaceLetterCommandInfo, PlayerState } from '@app/constants/basic-interface';
import { GameHistory, PlayerInfo, VirtualPlayerDifficulty } from '@app/constants/database-interfaces';
import { ILLEGAL_COMMAND } from '@app/constants/error-code-constants';
import { INVALID_WORD_MESSAGE, PASS_MESSAGE, SWAP_MESSAGE } from '@app/constants/game-state-constants';
import { CommandResult } from '@app/controllers/command.controller';
import { CommandFormattingService } from '@app/services/command-formatting.service';
import { PossibleWordFinder, PossibleWords } from '@app/services/possible-word-finder.service';
import { StatisticService } from '@app/services/statistics.service';
import { WordValidation } from '@app/services/word-validation.service';
import Container from 'typedi';
import { CommandDetails, VirtualPlayer } from './virtual-player';
import { VirtualPlayerHard } from './virtual-player-hard';

export class Game {
    private passCounter: number;
    private board: Board;
    private wordValidationService: WordValidation;
    private statisticsService: StatisticService;
    private players: Player[];
    private reserve: Reserve;
    private gameOver: boolean;
    private startDate: Date;
    private playerTurnIndex: number;
    private timer: NodeJS.Timeout;
    private timerEnabled : boolean
    private timerCallback: (username: string, result: CommandResult) => void;

    constructor(players: Player[], timerEnabled : boolean) {
        this.passCounter = 0;
        this.reserve = new Reserve();
        this.board = new Board();
        this.gameOver = false;
        this.players = players;
        this.timerEnabled = timerEnabled;
        this.wordValidationService = Container.get(WordValidation);
        this.statisticsService = Container.get(StatisticService);
    }

    startGame(timerCallback: (username: string, result: CommandResult) => void) {
        //if (this.players.length < 2) return;
        this.playerTurnIndex = Math.floor(Math.random() * this.players.length);
        for (const player of this.players) {
            player.getHand().addLetters(this.reserve.drawLetters(HAND_SIZE));
        }
        this.startDate = new Date();
        this.timerCallback = timerCallback;
        this.resetTimer();
    }

    placeLetter(commandInfo: PlaceLetterCommandInfo): CommandResult {
        const playerHand = this.players[this.playerTurnIndex].getHand();
        const name = this.players[this.playerTurnIndex].getName();
        const letters = playerHand.getLetters(commandInfo.letters, true);
        const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(commandInfo, this.board, letters);
        if (!formattedCommand) {
            playerHand.addLetters(letters as Letter[]);
            return { errorType: ILLEGAL_COMMAND };
        }
        const score = this.wordValidationService.validation(formattedCommand, this.board, true);
        if (!(this.players[this.playerTurnIndex] instanceof VirtualPlayer)) this.resetCounter();
        if (score < 0) {
            this.board.removeLetters(formattedCommand);
            playerHand.addLetters(letters as Letter[]);
            this.endTurn();
            return { playerMessage: { messageType: INVALID_WORD_MESSAGE, values: [name] } };
        }
        this.players[this.playerTurnIndex].addScore(score);
        const endMessage = this.endTurn();
        if (endMessage) {
            return { playerMessage: { messageType: `${score}`, values: [name] }, endGameMessage: endMessage };
        }
        playerHand.addLetters(this.reserve.drawLetters(HAND_SIZE - playerHand.getLength()));
        return { playerMessage: { messageType: `${score}`, values: [name] } };
    }

    swapLetters(stringLetters: string): CommandResult {
        if (!this.reserve.canSwap() || this.reserve.getLength() < stringLetters.length) return { errorType: ILLEGAL_COMMAND };
        const name = this.players[this.playerTurnIndex].getName();
        const activeHand = this.players[this.playerTurnIndex].getHand();
        const letters = activeHand.getLetters(stringLetters, true);
        if (!letters) return { errorType: ILLEGAL_COMMAND };
        activeHand.addLetters(this.reserve.drawLetters(HAND_SIZE - activeHand.getLength()));
        this.reserve.returnLetters(letters);
        if (!(this.players[this.playerTurnIndex] instanceof VirtualPlayer)) this.resetCounter();
        this.endTurn();
        return { playerMessage: { messageType: SWAP_MESSAGE, values: [name, stringLetters.length.toString()] } };
    }

    passTurn(): CommandResult {
        const name = this.players[this.playerTurnIndex].getName();
        if (!(this.players[this.playerTurnIndex] instanceof VirtualPlayer)) this.incrementCounter();
        const endMessage = this.endTurn();
        if (endMessage) {
            return { playerMessage: { messageType: PASS_MESSAGE, values: [name] }, endGameMessage: endMessage };
        }
        return { playerMessage: { messageType: PASS_MESSAGE, values: [name] } };
    }

    endGame(gaveUp?: string): string {
        clearTimeout(this.timer);
        this.gameOver = true;
        this.scorePlayers();
        let endMessage: string = '';
        let winner = this.getWinner(gaveUp);
        const timeElapsed = Math.round((Date.now() - this.startDate.getTime()) / 1000);
        for (const player of this.players) {
            if (player.getDatabaseId()) {
                this.statisticsService.addGameStats(player.getDatabaseId(), winner === player.getName(), player.getScore(), timeElapsed);
            }
            endMessage += '\n' + player.getName() + ' : ' + player.getHand().getLettersToString();
        }
        return endMessage;
    }

    createGameHistory(winnerIndex: number): GameHistory {
        const playerInfos: PlayerInfo[] = [];
        for (const player of this.players) {
            playerInfos.push(this.getPlayerInfo(player));
        }
        const gameHistory: GameHistory = {
            date: this.getFormattedDate(),
            time: this.getFormattedStartTime(),
            length: this.getFormattedDuration(),
            winnerIndex: winnerIndex,
            players: playerInfos
        };
        return gameHistory;
    }

    createGameState(): GameState {
        const playerStates: PlayerState[] = [];
        for (const player of this.players) {
            playerStates.push({
                username: player.getName(),
                hand: player.getHand().getLettersToString(),
                score: player.getScore()
            })
        }
        return {
            board: this.board.toStringArray(),
            playerTurnIndex: this.playerTurnIndex,
            players: playerStates,
            reserveLength: this.reserve.getLength(),
            gameOver: this.gameOver
        };
    }

    async findWords(virtualPlay: boolean): Promise<PossibleWords[]> {
        return await PossibleWordFinder.findWords(
            { hand: this.players[this.playerTurnIndex].getHand(), board: this.board },
            virtualPlay,
        );
    }
    getReserveContent(): string {
        return this.reserve.getReserveContent();
    }

    isGameOver(): boolean {
        return this.gameOver;
    }
    getReserveLength(): number {
        return this.reserve.getLength();
    }

    isPlayerTurn(playerID: string): boolean {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].getUUID() === playerID) {
                return i === this.playerTurnIndex;
            }
        }
        return false;
    }

    changeTurn() {
        this.playerTurnIndex = (this.playerTurnIndex + 1) % this.players.length;
    }

    resetTimer() {
        if(this.timerEnabled){
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                const username = this.players[this.playerTurnIndex].getName();
                const result = this.passTurn();
                this.timerCallback(username, result);
            }, MILLISECOND_IN_MINUTES);
        }
    }

    getWinner(gaveUp?: string): string {
        if (!this.gameOver) return '';
        let highestScore = -Infinity;
        let playerIndex = -1;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].getUUID() === gaveUp) continue;
            if (this.players[i].getScore() > highestScore) {
                highestScore = this.players[i].getScore();
                playerIndex = i;
            }
        }
        return this.players[playerIndex].getName();
    }

    async attemptVirtualPlay(): Promise<CommandDetails | null> {
        const currentPlayer = this.players[this.playerTurnIndex];
        if (!(currentPlayer instanceof VirtualPlayer)) return null;
        if (this.gameOver) return null;
        if (currentPlayer.isPlaying) return null;
        console.log(new Date().toLocaleTimeString() + ' | Start Virtual Play');
        const commandDetails = await currentPlayer.play();
        console.log(new Date().toLocaleTimeString() + ' | End Virtual Play');
        currentPlayer.endPlay();
        return commandDetails;
    }

    private scorePlayers() {
        let scoreSum: number = 0;
        let emptyHandIndex: number = -1;
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const score = player.getHand().calculateHandScore();
            if (score === 0) {
                emptyHandIndex = i;
            } else {
                scoreSum += score;
                player.addScore(-score);
            }
        }
        if (emptyHandIndex > -1) this.players[emptyHandIndex].addScore(scoreSum);
    }

    private endTurn(): string {
        let returnMessage = '';
        this.changeTurn();
        if (this.isGameFinished()) return this.endGame();

        return returnMessage;
    }
    private isGameFinished(): boolean {
        return this.passCounter === (NUMBER_PASS_ENDING_GAME * this.getNumberOfRealPlayers()) || (this.isAnyHandEmpty() && this.getReserveLength() === 0);
    }

    private isAnyHandEmpty(): boolean {
        for (const player of this.players) {
            if (player.getHand().getLength() === 0) return true;
        }
        return false;
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

    private getPlayerInfo(player: Player): PlayerInfo {
        const playerInfo: PlayerInfo = {
            name: player.getName(),
            score: player.getScore(),
            virtual: player instanceof VirtualPlayer,
        };
        if (playerInfo.virtual)
            playerInfo.difficulty = player instanceof VirtualPlayerHard ? VirtualPlayerDifficulty.EXPERT : VirtualPlayerDifficulty.BEGINNER;
        return playerInfo;
    }

    private getNumberOfRealPlayers(): number {
        let count = 0;
        for (let player of this.players) {
            if (player instanceof VirtualPlayer) continue;
            count++;
        }
        return count;
    }
}
