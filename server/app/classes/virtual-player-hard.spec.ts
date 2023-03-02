/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */

/*
import { Direction } from '@app/constants/basic-constants';
import { PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { PossibleWords } from '@app/services/possible-word-finder.service';
import { assert, expect } from 'chai';
import { describe } from 'mocha';
import { GameRoom } from './game-room';
import { GameSettings } from './game-settings';
import { Hand } from './hand';
import { Letter } from './letter';
import { Player } from './player';
import { VirtualPlayer } from './virtual-player';
import { VirtualPlayerHard } from './virtual-player-hard';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Sinon = require('sinon');
import { WordValidation } from '@app/services/word-validation.service';
*/
describe('VirtualPlayerHard', () => {
    /*
    let virtualPlayer: VirtualPlayer;
    const name = '1';
    const dict: string[] = ['aime', 'amie', 'poly'];
    const wordValidationService = new WordValidation(dict);
    let room: GameRoom;
    let realPlayer: Player;
    const firstWordCommandinfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 7, direction: Direction.Horizontal, letters: 'a i m e' };
    const secondWordCommandinfo: PlaceLetterCommandInfo = { letterCoord: 7, numberCoord: 8, direction: Direction.Vertical, letters: 'poly' };
    const thirdWordCommandinfo: PlaceLetterCommandInfo = { letterCoord: 10, numberCoord: 4, direction: Direction.Horizontal, letters: 'info' };
    const firstPossibleWord: PossibleWords = { command: firstWordCommandinfo, value: 8 };
    const secondPossibleWord: PossibleWords = { command: secondWordCommandinfo, value: 14 };
    const thirdPossibleword: PossibleWords = { command: thirdWordCommandinfo, value: 4 };
    const possibleWords: PossibleWords[] = [firstPossibleWord, secondPossibleWord, thirdPossibleword];
    const letterV = new Letter('v', 2);
    const letterI = new Letter('i', 3);
    const letterE = new Letter('e', 1);
    const letterA = new Letter('a', 2);
    const letterM = new Letter('m', 1);
    const letterN = new Letter('n', 1);
    const letterT = new Letter('t', 1);

    beforeEach(() => {
        const gameSettings: GameSettings = {
            hostPlayerName: 'HostPlayerNameTest',
            isSoloMode: true,
            timer: { minute: 1, second: 0 },
            dictionary: 'DictionaryNameTest',
            roomName: 'RoomNameTest',
            virtualPlayerName: 'VirtualPlayerNameTest',
            isEasyMode: true,
        };
        room = new GameRoom('testRoom', wordValidationService, gameSettings);
        realPlayer = new Player('16783jc', 'real');
        virtualPlayer = new VirtualPlayerHard(name, room);
        room.addPlayer(virtualPlayer);
        room.addPlayer(realPlayer);
        virtualPlayer.swapTurn();
    });
    it('getNumberToSwap should return 7 when the reserve is close to full', () => {
        expect(virtualPlayer['getNumberToSwap']()).to.be.equals(7);
    });
    it('getNumberToSwap should return the number of tiles remaining in the reserve when the reserve is close to empty', () => {
        room.getGame['reserve'].drawLetters(100);
        expect(virtualPlayer['getNumberToSwap']()).to.be.equals(room.getGame.getReserveLength());
    });
    it('getValidWord should return the highest value word', () => {
        expect(virtualPlayer['getValidWord'](possibleWords)).to.be.equals(secondPossibleWord);
    });
    it('play should only place a word when it is possible', () => {
        const spyPlace = Sinon.spy(room.getGame, 'placeLetter');
        virtualPlayer['hand'] = new Hand([letterV, letterA, letterI, letterT, letterM, letterE, letterN]);
        virtualPlayer.play();
        assert(spyPlace.called);
    });
    it('play should call swap but when no words are possible but swapping is', () => {
        const spySwap = Sinon.spy(room.getGame, 'swapLetters');
        virtualPlayer['hand'] = new Hand([letterV, letterI, letterN]);
        virtualPlayer.play();
        assert(spySwap.called);
    });
    it('play should call pass when nothing else is possible', () => {
        const spyPass = Sinon.spy(room.getGame, 'passTurn');
        virtualPlayer['hand'] = new Hand([letterV, letterV, letterV, letterV]);
        room.getGame['reserve'].drawLetters(105);
        virtualPlayer.play();
        assert(spyPass.called);
    });
    */
});
