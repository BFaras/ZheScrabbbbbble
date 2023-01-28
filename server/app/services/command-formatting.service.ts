import { Board } from '@app/classes/board';
import { Letter } from '@app/classes/letter';
import { Direction } from '@app/constants/basic-constants';
import { LetterPosition, PlaceLetterCommandInfo } from '@app/constants/basic-interface';

export class CommandFormattingService {
    static formatCommandPlaceLetter(commandInfo: PlaceLetterCommandInfo, board: Board, letters: Letter[] | null): LetterPosition[] | null {
        const letterPositions: LetterPosition[] = [];
        const startingTile = board.getTile(commandInfo.letterCoord, commandInfo.numberCoord);
        if (!letters) {
            return null;
        }
        if (!startingTile || startingTile.hasLetter()) {
            return null;
        }
        letterPositions.push({ letter: letters[0], x: commandInfo.letterCoord, y: commandInfo.numberCoord });
        if (letters.length === 1) {
            return letterPositions;
        }
        let extraLoops = 0;
        for (let i = 1; i < letters.length + extraLoops; i++) {
            let x: number;
            let y: number;
            if (commandInfo.direction === Direction.Vertical) {
                x = commandInfo.letterCoord + i;
                y = commandInfo.numberCoord;
            } else {
                x = commandInfo.letterCoord;
                y = commandInfo.numberCoord + i;
            }
            const tile = board.getTile(x, y);
            if (!tile) {
                return null;
            }
            if (!tile.hasLetter()) {
                letterPositions.push({ letter: letters[i - extraLoops], x, y });
            } else {
                extraLoops++;
            }
        }
        return letterPositions;
    }
}
