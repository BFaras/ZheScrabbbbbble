import { Game } from '@app/classes/game';
import { ErrorType } from '@app/constants/basic-constants';
import { PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { CommandVerificationService } from '@app/services/command-verification.service';
import { PossibleWords } from '@app/services/possible-word-finder.service';
import { RoomManagerService } from '@app/services/room-manager.service';

export interface Command {
    commandType: string;
    args: string;
    playerID: string;
}

export interface CommandResult {
    errorType?: ErrorType;
    activePlayerMessage?: string;
    otherPlayerMessage?: string;
    endGameMessage?: string;
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
        const room = this.roomManagerService.findRoomFromPlayer(command.playerID);
        if (!room) {
            return { errorType: ErrorType.IllegalCommand };
        }
        if (!room.isPlayerTurn(command.playerID) && CommandTypes[command.commandType] !== CommandTypes.Reserve) {
            return { errorType: ErrorType.IllegalCommand };
        }
        switch (CommandTypes[command.commandType]) {
            case CommandTypes.Pass:
                return room.getGame.passTurn();
            case CommandTypes.Place:
                return this.placeLetters(command.args, room.getGame);
            case CommandTypes.Swap:
                return this.swapLetters(command.args, room.getGame);
            case CommandTypes.Hint:
                return this.hintCommand(room.getGame);
            case CommandTypes.Reserve:
                return this.reserveMessage(room.getGame);
        }
        return { errorType: ErrorType.IllegalCommand };
    }

    private placeLetters(args: string, game: Game): CommandResult {
        const commandInfo: PlaceLetterCommandInfo | null = CommandVerificationService.verifyCommandPlaceLetter(args);
        if (!commandInfo) {
            return { errorType: ErrorType.InvalidSyntax };
        }
        return this.placeMessage(game.placeLetter(commandInfo), args);
    }
    private placeMessage(returnValue: CommandResult, args: string): CommandResult {
        if (returnValue.activePlayerMessage === '') {
            const validPlacementMessage = `a placé ${args} pour ${returnValue.otherPlayerMessage} point(s).`;
            returnValue.activePlayerMessage = validPlacementMessage;
            returnValue.otherPlayerMessage = validPlacementMessage;
        }
        return returnValue;
    }

    private swapLetters(args: string, game: Game): CommandResult {
        if (!CommandVerificationService.verifyCommandSwapLetters(args)) {
            return { errorType: ErrorType.InvalidSyntax };
        }
        return game.swapLetters(args);
    }
    private hintCommand(game: Game): CommandResult {
        const possibleWords = game.findWords(false);
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

    private reserveMessage(game: Game): CommandResult {
        return { activePlayerMessage: game.getReserveContent(), otherPlayerMessage: 'NotEndTurn' };
    }
}
