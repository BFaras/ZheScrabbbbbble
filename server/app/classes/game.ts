import { Board } from '@app/classes/board';
import { Letter } from '@app/classes/letter';
import { Player } from '@app/classes/player';
import { Reserve } from '@app/classes/reserve';
import {
    DECIMAL_BASE,
    ErrorType,
    HAND_SIZE,
    MAX_NUMBER_OF_PLAYERS,
    MILLISECOND_IN_HOURS,
    MILLISECOND_IN_MINUTES,
    MILLISECOND_IN_SECONDS,
    NUMBER_PASS_ENDING_GAME,
    TIME_BASE
} from '@app/constants/basic-constants';
import { GameState, PlaceLetterCommandInfo, PlayerState } from '@app/constants/basic-interface';
import { GameHistory, PlayerInfo, VirtualPlayerDifficulty } from '@app/constants/database-interfaces';
import { CommandResult } from '@app/controllers/command.controller';
import { CommandFormattingService } from '@app/services/command-formatting.service';
import { PossibleWordFinder, PossibleWords } from '@app/services/possible-word-finder.service';
import { WordValidation } from '@app/services/word-validation.service';
import { VirtualPlayer } from './virtual-player';
import { VirtualPlayerHard } from './virtual-player-hard';

export class Game {
    private passCounter: number;
    private board: Board;
    private wordValidationService: WordValidation;
    private players: Player[];
    private reserve: Reserve;
    private gameOver: boolean;
    private startDate: Date;
    private convertedSoloGame: boolean;
    private playerTurnIndex: number;

    constructor(wordValidation: WordValidation, players: Player[]) {
        this.passCounter = 0;
        this.reserve = new Reserve();
        this.board = new Board();
        this.gameOver = false;
        this.players = players;
        this.wordValidationService = wordValidation;
        this.convertedSoloGame = false;
    }

    startGame() {
        if (this.players.length === MAX_NUMBER_OF_PLAYERS) {
            this.playerTurnIndex = Math.floor(Math.random() * this.players.length);
            for (const player of this.players) {
                player.getHand().addLetters(this.reserve.drawLetters(HAND_SIZE));
            }
            this.startDate = new Date();
        }
    }

    placeLetter(commandInfo: PlaceLetterCommandInfo): CommandResult {
        const playerHand = this.players[this.playerTurnIndex].getHand();
        const letters = playerHand.getLetters(commandInfo.letters, true);
        const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(commandInfo, this.board, letters);
        if (!formattedCommand) {
            playerHand.addLetters(letters as Letter[]);
            return { errorType: ErrorType.IllegalCommand };
        }
        const score = this.wordValidationService.validation(formattedCommand, this.board, true);
        this.resetCounter();
        if (score < 0) {
            const invalidWordPlayerMessage = 'a tenté de placer un mot invalide.';
            this.board.removeLetters(formattedCommand);
            playerHand.addLetters(letters as Letter[]);
            this.endTurn();
            return { activePlayerMessage: invalidWordPlayerMessage, otherPlayerMessage: invalidWordPlayerMessage };
        }
        this.players[this.playerTurnIndex].addScore(score);
        const endMessage = this.endTurn();
        if (endMessage) {
            return { endGameMessage: endMessage };
        }
        playerHand.addLetters(this.reserve.drawLetters(HAND_SIZE - playerHand.getLength()));

        return { activePlayerMessage: '', otherPlayerMessage: `${score}` };
    }

    swapLetters(stringLetters: string): CommandResult {
        if (!this.reserve.canSwap() || this.reserve.getLength() < stringLetters.length) return { errorType: ErrorType.IllegalCommand };
        const activeHand = this.players[this.playerTurnIndex].getHand();
        const letters = activeHand.getLetters(stringLetters, true);
        if (!letters) return { errorType: ErrorType.IllegalCommand };
        activeHand.addLetters(this.reserve.drawLetters(HAND_SIZE - activeHand.getLength()));
        this.reserve.returnLetters(letters);
        this.resetCounter();
        this.endTurn();
        const activePlayerMessage = `a échangé les lettres ${stringLetters}.`;
        const otherPlayerMessage = `a échangé ${stringLetters.length} lettres.`;
        return { activePlayerMessage, otherPlayerMessage };
    }

    passTurn(): CommandResult {
        this.incrementCounter();
        const endMessage = this.endTurn();
        if (endMessage) {
            return { endGameMessage: endMessage };
        }
        const returnMessage = 'a passé son tour.';
        return { activePlayerMessage: returnMessage, otherPlayerMessage: returnMessage };
    }

    endGame(): string {
        this.gameOver = true;
        this.scorePlayers();
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
        };
        if (gameHistory.player1.virtual || gameHistory.player2.virtual) gameHistory.abandoned = this.isConvertedSoloGame;
        return gameHistory;
    }

    createGameState(): GameState {
        const playerStates: PlayerState[] = [];
        for(const player of this.players){
            playerStates.push({
                username: player.getName(),
                hand: player.getHand().getLettersToString(),
                score: player.getScore()
            })
        }
        return {
            finalBoard: this.board.toStringArray(),
            playerTurnIndex: this.playerTurnIndex,
            players: playerStates,
            reserveLength: this.reserve.getLength(),
            gameOver: this.gameOver
        };
    }

    findWords(virtualPlay: boolean): PossibleWords[] {
        return PossibleWordFinder.findWords(
            { hand: this.players[this.playerTurnIndex].getHand(), wordValidation: this.wordValidationService, board: this.board },
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

    convertSoloGame() {
        this.convertedSoloGame = true;
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
        this.playerTurnIndex = (this.playerTurnIndex + 1) % MAX_NUMBER_OF_PLAYERS;
    }

    private scorePlayers() {
        let scoreSum : number = 0;
        let emptyHandIndex : number = 0;
        for(let i = 0; i < this.players.length; i++){
            const player = this.players[i];
            const score = player.getHand().calculateHandScore();
            if (score === 0){
                emptyHandIndex = i;
            }else{
                scoreSum += score;
                player.addScore(-score);
            }
        }
        this.players[emptyHandIndex].addScore(scoreSum);
    }

    private endTurn(): string {
        let returnMessage = '';
        this.changeTurn();
        if (this.isGameFinished()) {
            returnMessage = this.endGame();
        }
        return returnMessage;
    }
    private isGameFinished(): boolean {
        return this.passCounter === NUMBER_PASS_ENDING_GAME || (this.isAnyHandEmpty() && this.getReserveLength() === 0);
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

    get isConvertedSoloGame(): boolean {
        return this.convertedSoloGame;
    }
}
