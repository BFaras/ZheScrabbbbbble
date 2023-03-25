/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
// import { Board } from '@app/classes/board';
// import { Hand } from '@app/classes/hand';
// //import { Hand } from '@app/classes/hand';
// import { Letter } from '@app/classes/letter';
// import { Multiplier, Tile } from '@app/classes/tile';
// import { MAX_SIZE_HINT, MAX_SIZE_VIRTUAL_PLAY } from '@app/constants/basic-constants';
// //import { MAX_SIZE_HINT, MAX_SIZE_VIRTUAL_PLAY } from '@app/constants/basic-constants';
// import { expect } from 'chai';
// //import * as fs from 'fs';
// import { PossibleWordFinder } from './possible-word-finder.service';
// import { WordValidation } from './word-validation.service';
// //import { WordValidation } from './word-validation.service';

// describe('PossibleWordFinder', () => {
//     describe('findPermutations', () => {
//         // Le nombre de permutations est trouvé avec n!+n!+n!/(n-1)!+n!/(n-2)! + ... pour n-* ­> 1
//         it('should return a array containing nothing when findPermutations is called with no letters', () => {
//             expect(PossibleWordFinder['findPermutations']([], 0).length).to.equal(0);
//         });
//         it('should return a array containing 1 string when findPermutations is called with a', () => {
//             expect(PossibleWordFinder['findPermutations'](['a'], 0).length).to.equal(1);
//         });
//         it('should return a array containing 2 string when findPermutations is called with aa, removing duplicate', () => {
//             expect(PossibleWordFinder['findPermutations'](['a', 'a'], 0).length).to.equal(2);
//         });
//         it('should return a array containing 4 strings when findPermutations is called with ab', () => {
//             expect(PossibleWordFinder['findPermutations'](['a', 'b'], 0).length).to.equal(4);
//         });
//         it('should return a array containing 15 strings when findPermutations is called with abc', () => {
//             expect(PossibleWordFinder['findPermutations'](['a', 'b', 'c'], 0).length).to.equal(15);
//         });
//         it('should return a array containing 64 strings when findPermutations is called with abcd', () => {
//             expect(PossibleWordFinder['findPermutations'](['a', 'b', 'c', 'd'], 0).length).to.equal(64);
//         });
//         it('should return a array containing 325 strings when findPermutations is called with abcde', () => {
//             expect(PossibleWordFinder['findPermutations'](['a', 'b', 'c', 'd', 'e'], 0).length).to.equal(325);
//         });
//         it('should return a array containing 1956 strings when findPermutations is called with abcdef', () => {
//             expect(PossibleWordFinder['findPermutations'](['a', 'b', 'c', 'd', 'e', 'f'], 0).length).to.equal(1956);
//         });
//         it('should return a array containing 13699 strings when findPermutations is called with abcdefg', () => {
//             expect(PossibleWordFinder['findPermutations'](['a', 'b', 'c', 'd', 'e', 'f', 'g'], 0).length).to.equal(13699);
//         });
//         it('should return an empty array when there are too many permutations to process', () => {
//             expect(PossibleWordFinder['findPermutations'](['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], 0).length).to.equal(0);
//         });
//     });

//     describe('findWord', () => {
//         const letterV = new Letter('v', 2);
//         const letterI = new Letter('i', 3);
//         const letterE = new Letter('e', 1);
//         const letterA = new Letter('a', 2);
//         const letterM = new Letter('m', 1);
//         const letterN = new Letter('n', 1);
//         const letterT = new Letter('t', 1);

//         beforeEach(() => {
//             PossibleWordFinder['wordValidation'] = new WordValidation();
//         });

//         it('should return the max number of words with virtual play on an empty board', () => {
//             expect(
//                 PossibleWordFinder.findWords(
//                     {
//                         hand: new Hand([letterA, letterE, letterI, letterM, letterN, letterT, letterV]),
//                         board: new Board(),
//                     },
//                     true,
//                 ).length,
//             ).to.be.greaterThanOrEqual(MAX_SIZE_VIRTUAL_PLAY);
//         });
//         it('should return the max number of words with hint on an empty board', () => {
//             expect(
//                 PossibleWordFinder.findWords(
//                     {
//                         hand: new Hand([letterA, letterE, letterI, letterM, letterN, letterT, letterV]),
//                         board: new Board(),
//                     },
//                     false,
//                 ).length,
//             ).to.be.greaterThanOrEqual(MAX_SIZE_HINT);
//         });
//         it('should return at least 3 words with hint on an empty board even when using blanks', () => {
//             const letterBlank = new Letter('blank', 0);
//             expect(
//                 PossibleWordFinder.findWords(
//                     {
//                         hand: new Hand([letterE, letterI, letterBlank, letterM, letterN, letterT, letterV]),
//                         board: new Board(),
//                     },
//                     false,
//                 ).length,
//             ).to.be.greaterThanOrEqual(3);
//         });
//         it('should return at least half the max number of words when virtual play on empty board even when using two blanks', () => {
//             const letterBlank = new Letter('blank', 0);
//             expect(
//                 PossibleWordFinder.findWords(
//                     {
//                         hand: new Hand([letterE, letterI, letterBlank, letterBlank, letterN, letterT, letterV]),
//                         board: new Board(),
//                     },
//                     true,
//                 ).length,
//             ).to.be.greaterThanOrEqual(MAX_SIZE_VIRTUAL_PLAY / 2);
//         });
//         it('should return the max number of words  with hint on a board with a word', () => {
//             const gameBoard = new Board();
//             gameBoard.getTile(7, 6)?.placeLetter(letterV);
//             gameBoard.getTile(7, 7)?.placeLetter(letterI);
//             gameBoard.getTile(7, 8)?.placeLetter(letterE);
//             expect(
//                 PossibleWordFinder.findWords(
//                     {
//                         hand: new Hand([letterA, letterE, letterI, letterM, letterN, letterT, letterV]),
//                         board: gameBoard,
//                     },
//                     false,
//                 ).length,
//             ).to.be.greaterThanOrEqual(MAX_SIZE_HINT);
//         });
//         it('should return the max number of words with virtual play on a board with a word', () => {
//             const gameBoard = new Board();
//             gameBoard.getTile(7, 6)?.placeLetter(letterV);
//             gameBoard.getTile(7, 7)?.placeLetter(letterI);
//             gameBoard.getTile(7, 8)?.placeLetter(letterE);
//             expect(
//                 PossibleWordFinder.findWords(
//                     {
//                         hand: new Hand([letterA, letterE, letterI, letterM, letterN, letterT, letterV]),
//                         board: gameBoard,
//                     },
//                     true,
//                 ).length,
//             ).to.be.greaterThanOrEqual(MAX_SIZE_VIRTUAL_PLAY);
//         });
//     });

//     describe('findTiles', () => {
//         const letterV = new Letter('v', 2);
//         const letterI = new Letter('i', 3);
//         const letterE = new Letter('e', 1);

//         it('should return no tile when findOccupiedTiles() is called on empty board', () => {
//             expect(PossibleWordFinder['findOccupiedTiles'](new Board()).length).to.equals(0);
//         });
//         it('should return 3 tiles when findOccupiedTiles() is called a board with vie', () => {
//             const gameBoard = new Board();
//             gameBoard.getTile(7, 6)?.placeLetter(letterV);
//             gameBoard.getTile(7, 7)?.placeLetter(letterI);
//             gameBoard.getTile(7, 8)?.placeLetter(letterE);
//             expect(PossibleWordFinder['findOccupiedTiles'](gameBoard).length).to.equals(3);
//         });
//         it('should return false when validateTile() is called on null', () => {
//             expect(PossibleWordFinder['validateTile'](null)).to.equals(false);
//         });
//         it('should return true when validateTile() is called on an empty tile', () => {
//             expect(PossibleWordFinder['validateTile'](new Tile(Multiplier.Normal))).to.equals(true);
//         });
//         it('should return false when validateTile() is called on an occupied tile', () => {
//             const tile = new Tile(Multiplier.Normal);
//             tile.placeLetter(new Letter('a', 1));
//             expect(PossibleWordFinder['validateTile'](tile)).to.equals(false);
//         });
//         it('should return an empty array when addValidTile() is called on an out of bound position', () => {
//             expect(PossibleWordFinder['addValidTile'](new Board(), { x: 16, y: 17 })).to.eql([]);
//         });
//         it('should return an array with the given position when addValidTile() is called on a correct tile', () => {
//             expect(PossibleWordFinder['addValidTile'](new Board(), { x: 5, y: 8 })).to.eql([{ x: 5, y: 8 }]);
//         });
//         it('should return an array with the 4 position adjacent to the one given when findAdjacent() is called', () => {
//             expect(PossibleWordFinder['findAdjacent'](new Board(), { x: 7, y: 7 })).to.eql([
//                 { x: 7, y: 8 },
//                 { x: 7, y: 6 },
//                 { x: 8, y: 7 },
//                 { x: 6, y: 7 },
//             ]);
//         });
//         it('should return the center tile when findAdjacentOccupied() is called on empty board', () => {
//             expect(PossibleWordFinder['findAdjacentOccupied'](new Board())).to.eql([{ x: 7, y: 7 }]);
//         });
//         it('should return 4 tiles when findAdjacentOccupied() is called a board with one letter', () => {
//             const gameBoard = new Board();
//             gameBoard.getTile(7, 7)?.placeLetter(letterI);
//             expect(PossibleWordFinder['findAdjacentOccupied'](gameBoard).length).to.equals(4);
//         });
//         it('should return 6 commands when findPossibleFromTile() is called with a 3 letter permutation', () => {
//             expect(PossibleWordFinder['findPossibleFromTile']({ x: 7, y: 9 }, new Board(), 'aaa').length).to.equals(6);
//         });
//         it('should return 4 commands when findPossibleFromTile() is called with a 2 letter permutation', () => {
//             expect(PossibleWordFinder['findPossibleFromTile']({ x: 7, y: 9 }, new Board(), 'aa').length).to.equals(4);
//         });
//         it('should return 1 command1 when findPossibleFromTile() is called with a 1 letter permutation', () => {
//             expect(PossibleWordFinder['findPossibleFromTile']({ x: 7, y: 9 }, new Board(), 'a').length).to.equals(1);
//         });
//         it('should return 2 command1 when findPlacements() is called with a 1 letter permutation and 2 positions', () => {
//             expect(
//                 PossibleWordFinder['findPlacements'](
//                     [
//                         { x: 7, y: 8 },
//                         { x: 7, y: 9 },
//                     ],
//                     new Board(),
//                     'a',
//                 ).length,
//             ).to.equals(2);
//         });
//         it('should return 8 command1 when findPlacements() is called with a 2 letter permutation and 2 positions', () => {
//             expect(
//                 PossibleWordFinder['findPlacements'](
//                     [
//                         { x: 7, y: 7 },
//                         { x: 8, y: 8 },
//                     ],
//                     new Board(),
//                     'aa',
//                 ).length,
//             ).to.equals(8);
//         });
//     });
// });
