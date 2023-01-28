/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Direction } from '@app/constants/basic-constants';
import { expect } from 'chai';
import { CommandVerificationService } from './command-verification.service';

describe('CommandVerificationService', () => {
    describe('verifyCommandPlaceLetter()', () => {
        it('should accept command "a1h aba"', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a1h aba')).to.not.be.null;
        });

        it('should accept command "a15v aba"', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a15v aba')).to.not.be.null;
        });

        it('should accept command "a15 a" where direction is not specified but only 1 letter is placed', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a15 a')).to.not.be.null;
        });

        it('should accept command "a1h aBa" where B is a blank tile', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a1h aBa')).to.not.be.null;
        });

        it('should not accept command "A1h aba" where letter coordinate is in upper case', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('A1h aba')).to.be.null;
        });

        it('should not accept command "A1h a*a" where letters contain non-alphabetic characters', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('A1h a*a')).to.be.null;
        });

        it('should not accept command "a1H aba" where direction is in upper case', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a1H aba')).to.be.null;
        });

        it('should not accept command "11h aba" where letter coordinate is invalid', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('11h aba')).to.be.null;
        });

        it('should not accept command "z1h aba" where letter coordinate is invalid', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('z1h aba')).to.be.null;
        });

        it('should not accept command "aah aba" where number coordinate is invalid', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('aah aba')).to.be.null;
        });

        it('should not accept command "a0h aba" where number coordinate is invalid', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a0h aba')).to.be.null;
        });

        it('should not accept command "a105h aba" where number coordinate is invalid', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a105h aba')).to.be.null;
        });

        it('should not accept command "a1u aba" where direction is invalid', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a1u aba')).to.be.null;
        });

        it('should not accept command "a1 aba" where direction is not specified but more than 1 letter is placed', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a1 aba')).to.be.null;
        });

        it('should not accept command "a1h" where no letters where specified', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a1h')).to.be.null;
        });

        it('should not accept command "a1h aaaaaaaa" where more than 7 letters where specified', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('a1h aaaaaaaa')).to.be.null;
        });

        it('should not accept empty string command', () => {
            expect(CommandVerificationService.verifyCommandPlaceLetter('')).to.be.null;
        });
    });

    describe('verifyCommandSwapLetters()', () => {
        it('should return true if string only contains lowercase letters or the * symbol', () => {
            expect(CommandVerificationService.verifyCommandSwapLetters('abc*')).to.be.true;
        });

        it('should return false if string does not only contain lowercase letters or the * symbol', () => {
            expect(CommandVerificationService.verifyCommandSwapLetters('HELLO')).to.be.false;
        });

        it('should return false if string is bigger than 7', () => {
            expect(CommandVerificationService.verifyCommandSwapLetters('abcdefghijklmnop')).to.be.false;
        });

        it('should return false if string is empty', () => {
            expect(CommandVerificationService.verifyCommandSwapLetters('')).to.be.false;
        });
    });

    describe('isAlphabetic()', () => {
        it('should return true if string only contains letters', () => {
            expect(CommandVerificationService['isAlphabetic']('HelloWorld')).to.be.true;
        });

        it('should return false if string does not only contain letters', () => {
            expect(CommandVerificationService['isAlphabetic']('*H3ll0 W0rld*')).to.be.false;
        });
    });

    describe('isLowerCase()', () => {
        it('should return true if string only contains lower case letters', () => {
            expect(CommandVerificationService['isLowerCase']('helloworld')).to.be.true;
        });

        it('should return false if string does not only contain letters', () => {
            expect(CommandVerificationService['isLowerCase']('*h3ll0 w0rld*')).to.be.false;
        });

        it('should return false if string contains capital letters', () => {
            expect(CommandVerificationService['isLowerCase']('HELLOWORLD')).to.be.false;
        });
    });
    describe('recreateCommand', () => {
        it('should return the correct command', () => {
            expect(
                CommandVerificationService.recreateCommand({ letterCoord: 0, numberCoord: 0, direction: Direction.Horizontal, letters: 'elan' }),
            ).to.equal('!placer a1h elan');
        });
    });
});
