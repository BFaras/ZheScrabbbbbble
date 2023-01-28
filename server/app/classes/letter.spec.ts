import { expect } from 'chai';
import { describe } from 'mocha';
import { Letter } from './letter';

describe('Letter', () => {
    it('should create a letter containing A and with a value of 1', () => {
        const letter: Letter = new Letter('a', 1);

        expect(letter.getChar()).to.equals('a');
        expect(letter.getValue()).to.equals(1);
    });
    it('should still be A after calling changeBlank() on A', () => {
        const letter: Letter = new Letter('a', 1);
        letter.changeBlank('y');
        expect(letter.getChar()).to.equals('a');
    });
    it('should be Y after calling changeBlank() on BLANK', () => {
        const letter: Letter = new Letter('blank', 0);
        letter.changeBlank('y');
        expect(letter.getChar()).to.equals('y');
    });
});
