import { BOARD_SIZE, CHAR_CODE_LETTER_A, Direction, HAND_SIZE } from '@app/constants/basic-constants';
import { PlaceLetterCommandInfo } from '@app/constants/basic-interface';

interface VerificationCondition {
    letterCoord: boolean;
    numberCoord: boolean;
    numberOfLetters: boolean;
    direction: boolean;
}

export class CommandVerificationService {
    static verifyCommandPlaceLetter(command: string): PlaceLetterCommandInfo | null {
        const coordinate = command.split(' ')[0];
        const letters = command.split(' ')[1];

        if (!this.isAlphabetic(letters)) {
            return null;
        }

        const letterCoord = coordinate.charCodeAt(0) - CHAR_CODE_LETTER_A;
        const numberCoord = Number(coordinate.replace(/[^0-9]/g, '')) - 1;
        const directionChar = coordinate.charAt(coordinate.length - 1);
        const numberOfLetters = letters === undefined ? 0 : letters.length;

        let directionIsValid;

        const letterCoordIsValid = letterCoord >= 0 && letterCoord <= BOARD_SIZE - 1;
        const numberCoordIsValid = numberCoord >= 0 && numberCoord <= BOARD_SIZE - 1;
        const numberOfLettersIsValid = numberOfLetters > 0 && numberOfLetters <= HAND_SIZE;

        if (directionChar === 'h' || directionChar === 'v') {
            directionIsValid = true;
        } else if (numberOfLetters === 1 && !Number.isNaN(directionChar)) {
            directionIsValid = true;
        } else {
            directionIsValid = false;
        }

        if (
            !this.commandValidation({
                letterCoord: letterCoordIsValid,
                numberCoord: numberCoordIsValid,
                numberOfLetters: numberOfLettersIsValid,
                direction: directionIsValid,
            })
        ) {
            return null;
        }
        const direction = directionChar === 'v' ? Direction.Vertical : Direction.Horizontal;
        const commandInfo: PlaceLetterCommandInfo = {
            letterCoord,
            numberCoord,
            direction,
            letters,
        };
        return commandInfo;
    }

    static recreateCommand(commandInfo: PlaceLetterCommandInfo): string {
        const directionChar = commandInfo.direction === Direction.Horizontal ? 'h' : 'v';
        return (
            '!placer ' +
            String.fromCharCode(commandInfo.letterCoord + CHAR_CODE_LETTER_A) +
            (commandInfo.numberCoord + 1) +
            directionChar +
            ' ' +
            commandInfo.letters
        );
    }

    static verifyCommandSwapLetters(command: string): boolean {
        if (command.length < 1 || command.length > HAND_SIZE) {
            return false;
        }
        for (const letter of command) {
            if (!this.isLowerCase(letter) && letter !== '*') {
                return false;
            }
        }
        return true;
    }

    private static isAlphabetic(str: string): boolean {
        return /^[a-zA-Z()]+$/.test(str);
    }

    private static isLowerCase(str: string): boolean {
        return /^[a-z()]+$/.test(str);
    }
    private static commandValidation(condition: VerificationCondition) {
        return condition.letterCoord && condition.numberCoord && condition.numberOfLetters && condition.direction;
    }
}
