import { Game } from '@app/classes/game';
import { PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { INVALID_COMMAND_SYNTAX, NOT_IN_GAME, NOT_YOUR_TURN, UNKNOWN_ACTION } from '@app/constants/error-code-constants';
import { PLACE_MESSAGE } from '@app/constants/game-state-constants';
import { CommandVerificationService } from '@app/services/command-verification.service';
import { PossibleWords } from '@app/services/possible-word-finder.service';
import { RoomManagerService } from '@app/services/room-manager.service';

export const HINT_WORD_LIMIT = 5;

export interface Command {
    commandType: string;
    args: string;
    playerID: string;
    isCoop?: boolean;
}

export interface CommandResult {
    errorType?: string;
    playerMessage?: PlayerMessage;
    endGameMessage?: string;
}

export interface PlayerMessage {
    messageType: string;
    values: string[];
}

export enum CommandTypes {
    Pass,
    Swap,
    Place,
    Hint,
    Reserve,
}

export class CommandController {
    private roomManagerService: RoomManagerService;

    constructor(roomManagerService: RoomManagerService) {
        this.roomManagerService = roomManagerService;
    }

    executeCommand(command: Command): CommandResult {
        const game = this.roomManagerService.findRoomFromPlayer(command.playerID)?.getGame;
        if (!game) {
            return { errorType: NOT_IN_GAME };
        }
        const isPlayerTurn = command.isCoop ? true : game.isPlayerTurn(command.playerID);
        if (!isPlayerTurn && CommandTypes[command.commandType] !== CommandTypes.Reserve) {
            return { errorType: NOT_YOUR_TURN };
        }
        switch (CommandTypes[command.commandType]) {
            case CommandTypes.Pass:
                return game.passTurn();
            case CommandTypes.Place:
                return this.placeLetters(command.args, game);
            case CommandTypes.Swap:
                return this.swapLetters(command.args, game);
        }
        return { errorType: UNKNOWN_ACTION };
    }

    async hintCommand(game: Game): Promise<{command: string, value: number}[]> {
        const possibleWords = await game.findWords(false);
        this.shuffleWords(possibleWords);
        return this.hintMessage(possibleWords);
    }

    private placeLetters(args: string, game: Game): CommandResult {
        const commandInfo: PlaceLetterCommandInfo | null = CommandVerificationService.verifyCommandPlaceLetter(args);
        if (!commandInfo) {
            return { errorType: INVALID_COMMAND_SYNTAX };
        }
        return this.placeMessage(game.placeLetter(commandInfo), args);
    }

    private placeMessage(returnValue: CommandResult, args: string): CommandResult {
        if(!returnValue.playerMessage) return {errorType: INVALID_COMMAND_SYNTAX}
        if (isNaN(Number(returnValue.playerMessage.messageType))) return returnValue;
        returnValue.playerMessage = {messageType: PLACE_MESSAGE, values: [returnValue.playerMessage.values[0], args.split(' ')[1], returnValue.playerMessage.messageType]};
        return returnValue;
    }

    private swapLetters(args: string, game: Game): CommandResult {
        if (!CommandVerificationService.verifyCommandSwapLetters(args)) {
            return { errorType: INVALID_COMMAND_SYNTAX };
        }
        return game.swapLetters(args);
    }

    
    
    private shuffleWords(possibleWords: PossibleWords[]) {
        for (let i = possibleWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [possibleWords[i], possibleWords[j]] = [possibleWords[j], possibleWords[i]];
        }
    }
    private hintMessage(possibleWords: PossibleWords[]): {command: string, value: number}[] {
        const commands = [];
        const limit = possibleWords.length < HINT_WORD_LIMIT ? possibleWords.length : HINT_WORD_LIMIT; 
        for(let i = 0; i < limit; i++){
            commands.push({command: CommandVerificationService.recreateCommand(possibleWords[i].command), value: possibleWords[i].value});
        }
        return commands;
    }
}
