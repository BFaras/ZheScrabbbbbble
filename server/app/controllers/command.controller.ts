import { Game } from '@app/classes/game';
import { PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { INVALID_COMMAND_SYNTAX, NOT_IN_GAME, NOT_YOUR_TURN, UNKNOWN_ACTION } from '@app/constants/error-code-constants';
import { PLACE_MESSAGE } from '@app/constants/game-state-constants';
import { CommandVerificationService } from '@app/services/command-verification.service';
import { RoomManagerService } from '@app/services/room-manager.service';

export interface Command {
    commandType: string;
    args: string;
    playerID: string;
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
        if (!game.isPlayerTurn(command.playerID) && CommandTypes[command.commandType] !== CommandTypes.Reserve) {
            return { errorType: NOT_YOUR_TURN };
        }
        switch (CommandTypes[command.commandType]) {
            case CommandTypes.Pass:
                return game.passTurn();
            case CommandTypes.Place:
                return this.placeLetters(command.args, game);
            case CommandTypes.Swap:
                return this.swapLetters(command.args, game);
            case CommandTypes.Hint:
                //TODO Fix hints
                return game.passTurn();
                //return this.hintCommand(game);
            case CommandTypes.Reserve:
                //TODO Fix reserve
                return game.passTurn();
                //return this.reserveMessage(game);
        }
        return { errorType: UNKNOWN_ACTION };
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
    /*
    private async hintCommand(game: Game): Promise<CommandResult> {
        const possibleWords = await game.findWords(false);
        this.shuffleWords(possibleWords);
        return this.hintMessage(possibleWords);
    }
    private shuffleWords(possibleWords: PossibleWords[]) {
        for (let i = possibleWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [possibleWords[i], possibleWords[j]] = [possibleWords[j], possibleWords[i]];
        }
    }
    private hintMessage(possibleWords: PossibleWords[]): CommandResult {
        switch (possibleWords.length) {
            case 0:
                return { activePlayerMessage: 'Aucun mot possible trouvé', otherPlayerMessage: 'NotEndTurn' };
            case 1:
                return {
                    activePlayerMessage: 'Seulement un mot trouvé : \n' + CommandVerificationService.recreateCommand(possibleWords[0].command),
                    otherPlayerMessage: 'NotEndTurn',
                };
            case 2:
                return {
                    activePlayerMessage:
                        'Seulement deux mots trouvés : \n' +
                        CommandVerificationService.recreateCommand(possibleWords[0].command) +
                        '\n' +
                        CommandVerificationService.recreateCommand(possibleWords[1].command),
                    otherPlayerMessage: 'NotEndTurn',
                };
        }
        return {
            activePlayerMessage:
                'Indice : \n' +
                CommandVerificationService.recreateCommand(possibleWords[0].command) +
                '\n' +
                CommandVerificationService.recreateCommand(possibleWords[1].command) +
                '\n' +
                CommandVerificationService.recreateCommand(possibleWords[2].command),
            otherPlayerMessage: 'NotEndTurn',
        };
    }
    */
    /*
    private reserveMessage(game: Game): CommandResult {
        return { activePlayerMessage: game.getReserveContent(), otherPlayerMessage: 'NotEndTurn' };
    }
    */
}
