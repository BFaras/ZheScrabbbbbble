import { SHUFFLING_CONSTANT } from '@app/constants/basic-constants';
import { PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { ILLEGAL_COMMAND } from '@app/constants/error-code-constants';
import { CommandResult } from '@app/controllers/command.controller';
import { CommandVerificationService } from '@app/services/command-verification.service';
import { PossibleWords } from '@app/services/possible-word-finder.service';
import { GameRoom } from './game-room';
import { Player } from './player';

export enum Score {
    LessThanSix,
    BetweenSevenToTwelve,
    BetweenThirteenToEighteen,
}
export interface CommandDetails {
    command: string;
    result: CommandResult;
}

export abstract class VirtualPlayer extends Player {
    protected static numberOfInstance = 0;
    protected gameRoom: GameRoom;
    protected playing: boolean;

    constructor(name: string, gameRoom: GameRoom) {
        super((VirtualPlayer.numberOfInstance++).toString(), '', name);
        this.gameRoom = gameRoom;
        this.playing = false;
    }

    endPlay() {
        this.playing = false;
    }

    protected pass(): CommandDetails {
        return { command: '!passer', result: this.gameRoom.getGame.passTurn() };
    }

    protected swap(): CommandDetails {
        const shuffledHand: string[] = this.getHand()
            .getLettersToString()
            .sort(() => SHUFFLING_CONSTANT - Math.random());
        const letterToSwap: string[] = shuffledHand.slice(0, this.getNumberToSwap());
        const finalResult: CommandResult = this.gameRoom.getGame.swapLetters(letterToSwap.join(''));
        letterToSwap.forEach((letter: string) => {
            if (letter === 'blank') letter = '*';
        });
        return { command: '!échanger ' + letterToSwap.join(''), result: finalResult };
    }
    protected async place(): Promise<CommandDetails> {
        const possibleWord: PossibleWords[] = await this.gameRoom.getGame.findWords(true);
        if (possibleWord.length === 0) return { command: '', result: { errorType: ILLEGAL_COMMAND } };
        const validWord: PossibleWords = this.getValidWord(possibleWord);
        const wordToPlace: PlaceLetterCommandInfo = validWord?.command as PlaceLetterCommandInfo;
        return { command: CommandVerificationService.recreateCommand(wordToPlace), result: this.gameRoom.getGame.placeLetter(wordToPlace) };
    }

    get isPlaying(): boolean {
        return this.playing;
    }

    abstract play(): Promise<CommandDetails>;

    protected abstract getNumberToSwap(): number;

    protected abstract getValidWord(possibleWord: PossibleWords[]): PossibleWords;
}
