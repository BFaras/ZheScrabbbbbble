/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { Board } from '@app/classes/board';
import { Hand } from '@app/classes/hand';
import { Letter } from '@app/classes/letter';
import { Direction } from '@app/constants/basic-constants';
import { PlaceLetterCommandInfo } from '@app/constants/basic-interface';
import { expect } from 'chai';
import { CommandFormattingService } from './command-formatting.service';

describe('CommandFormattingService', () => {
    describe('formatCommandPlaceLetter', () => {
        let board: Board;
        let placeLetterCommandInfo: PlaceLetterCommandInfo;
        let playerHand: Hand;
        beforeEach(() => {
            board = new Board();
            playerHand = new Hand([new Letter('a', 0), new Letter('a', 0), new Letter('b', 0), new Letter('blank', 0)]);
        });

        it('should transform place letter command into a list of valid letters and positions if placement is vertical', () => {
            placeLetterCommandInfo = { letterCoord: 0, numberCoord: 0, direction: Direction.Vertical, letters: 'aba' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.eql([
                { letter: { char: 'a', value: 0 }, x: 0, y: 0 },
                { letter: { char: 'b', value: 0 }, x: 1, y: 0 },
                { letter: { char: 'a', value: 0 }, x: 2, y: 0 },
            ]);
        });

        it('should transform place letter command into a list of valid letters and positions if placement is horizontal', () => {
            placeLetterCommandInfo = { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'aba' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.eql([
                { letter: { char: 'a', value: 0 }, x: 0, y: 0 },
                { letter: { char: 'b', value: 0 }, x: 0, y: 1 },
                { letter: { char: 'a', value: 0 }, x: 0, y: 2 },
            ]);
        });

        it('should transform place letter command into a list of valid letters and positions if letters contain blank', () => {
            placeLetterCommandInfo = { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'abA' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.eql([
                { letter: { char: 'a', value: 0 }, x: 0, y: 0 },
                { letter: { char: 'b', value: 0 }, x: 0, y: 1 },
                { letter: { char: 'a', value: 0 }, x: 0, y: 2 },
            ]);
        });

        it('should jump over board letters if placement is vertical', () => {
            board['tiles'][1][0].placeLetter(new Letter('a', 0));
            placeLetterCommandInfo = { letterCoord: 0, numberCoord: 0, direction: Direction.Vertical, letters: 'aba' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.eql([
                { letter: { char: 'a', value: 0 }, x: 0, y: 0 },
                { letter: { char: 'b', value: 0 }, x: 2, y: 0 },
                { letter: { char: 'a', value: 0 }, x: 3, y: 0 },
            ]);
        });

        it('should jump over board letters if placement is horizontal', () => {
            board['tiles'][0][1].placeLetter(new Letter('a', 0));
            placeLetterCommandInfo = { letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'aba' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.eql([
                { letter: { char: 'a', value: 0 }, x: 0, y: 0 },
                { letter: { char: 'b', value: 0 }, x: 0, y: 2 },
                { letter: { char: 'a', value: 0 }, x: 0, y: 3 },
            ]);
        });

        it('should return null if letters are invalid', () => {
            placeLetterCommandInfo = { letterCoord: 0, numberCoord: 0, direction: Direction.Vertical, letters: '123' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.be.null;
        });

        it('should return null if starting tile is occupied', () => {
            board['tiles'][0][0].placeLetter(new Letter('a', 0));
            placeLetterCommandInfo = { letterCoord: 0, numberCoord: 0, direction: Direction.Vertical, letters: 'aba' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.be.null;
        });

        it('should return null if letters not in hand', () => {
            placeLetterCommandInfo = { letterCoord: 0, numberCoord: 0, direction: Direction.Vertical, letters: 'abb' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.be.null;
        });

        it('should return null if letters go over max size of the board vertically', () => {
            board['tiles'][13][0].placeLetter(new Letter('a', 0));
            placeLetterCommandInfo = { letterCoord: 12, numberCoord: 0, direction: Direction.Vertical, letters: 'aba' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.be.null;
        });

        it('should return null if letters go over max size of the board horizontally', () => {
            board['tiles'][0][13].placeLetter(new Letter('a', 0));
            placeLetterCommandInfo = { letterCoord: 0, numberCoord: 12, direction: Direction.Horizontal, letters: 'aba' };
            const letters = playerHand.getLetters(placeLetterCommandInfo.letters, true);
            const formattedCommand = CommandFormattingService.formatCommandPlaceLetter(placeLetterCommandInfo, board, letters);
            expect(formattedCommand).to.be.null;
        });
    });
});
