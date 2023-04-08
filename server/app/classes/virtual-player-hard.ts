import { MAX_HAND, MIN_PLAY_TIME } from '@app/constants/basic-constants';
import { PLACE_MESSAGE } from '@app/constants/game-state-constants';
import { PossibleWords } from '@app/services/possible-word-finder.service';
import { CommandDetails, VirtualPlayer } from './virtual-player';

export class VirtualPlayerHard extends VirtualPlayer {
    async play(): Promise<CommandDetails> {
        const minTime: number = Date.now() + MIN_PLAY_TIME;
        this.playing = true;
        let details: CommandDetails = await this.place();
        if (details.result.errorType === undefined && details.command.split(' ')[0] === 'Place')
            details.result.playerMessage = { messageType: PLACE_MESSAGE, values: [this.getName(), details.command.split(' ')[2], details.result.playerMessage!.messageType] };
        if (details.result.errorType !== undefined) details = this.swap();
        if (details.result.errorType !== undefined) details = this.pass();
        while (Date.now() < minTime);
        return details;
    }
    protected getValidWord(possibleWord: PossibleWords[]): PossibleWords {
        possibleWord.sort((firsWord, secondWord) => firsWord.value - secondWord.value);
        return possibleWord[possibleWord.length - 1];
    }
    protected getNumberToSwap() {
        return Math.min(MAX_HAND, this.gameRoom.getGame.getReserveLength());
    }
}
