export const GRID_CONSTANTS = {
    defaultWidth: 800,
    defaultHeight: 800,
    defaultSide: 50, // 800/16
    defaultLineWidth: 1,
    rowColumnCount: 15,
    lastLetter: -1,
};

export enum DIRECTION {
    Horizontal = 'h',
    Vertical = 'v',
}

export const GRID_OFFSETS = {
    wordOffset: 1.6,
    multiplicatorOffset: 1.3,
    letterOffsetH: 2.3,
    letterOffsetV: 1.5,
    pointOffsetH: 1.7,
    pointOffsetV: 2.2,
    defaultLineWidth: 1,
    arrowH: 2,
    arrowV: 0.95,
};

export const GRID_WORDS_FR = {
    pinkRedWord: 'MOT',
    startWord: 'DÉBUT',
    blueWord: 'LETTRE',
    doubleWord: 'x2',
    tripleWord: 'x3',
    defaultFontSize: '11',
};

export const GRID_WORDS_EN = {
    pinkRedWord: 'WORD',
    startWord: 'START',
    blueWord: 'LETTER',
    doubleWord: 'x2',
    tripleWord: 'x3',
    defaultFontSize: '11',
};

export const GRID_COLOURS_CLASSIC = {
    defaultRed: '#cb654f',
    defaultPink: '#d3b1a7',
    defaultBlue: '#679089',
    defaultLightBlue: '#8cbea3',
    defaultBlack: 'black',
    defaultWhite: '#FAF5F1',
    defaultDarkRed: '#520000',
    defaultBackground: '#cfcb9c',
};

export const GRID_COLOURS_INVERTED = {
    defaultRed: '#349ab0',
    defaultPink: '#2c4e58',
    defaultBlue: '#986f76',
    defaultLightBlue: '#73415c',
    defaultBlack: 'white',
    defaultWhite: '#050a0e',
    defaultDarkRed: '#adffff',
    defaultBackground: '#303463',
};

export const GRID_COLOURS_GREEN = {
    defaultRed: '#89b034',
    defaultPink: '#3d582c',
    defaultBlue: '#74986f',
    defaultLightBlue: '#417344',
    defaultBlack: 'white',
    defaultWhite: '#050a0e',
    defaultDarkRed: '#cdffad',
    defaultBackground: '#0e5600',
};

export const GRID_COLOURS_PINK = {
    defaultRed: '#cb4f7f',
    defaultPink: '#d3a7bc',
    defaultBlue: '#a75c8c',
    defaultLightBlue: '#be8cb1',
    defaultBlack: 'black',
    defaultWhite: '#faf1fa',
    defaultDarkRed: '#520027',
    defaultBackground: '#cf9cad',
};

export const ROWS: { [key: string]: number } = {};
export const COLUMNS: { [key: string]: number } = {};

const setCoordinates = () => {
    let squareSizeIncrement: number = GRID_CONSTANTS.defaultSide;
    for (let letter = 'A'.charCodeAt(0); letter <= 'O'.charCodeAt(0); letter++) {
        ROWS[String.fromCharCode(letter)] = squareSizeIncrement;
        squareSizeIncrement += GRID_CONSTANTS.defaultSide;
    }
    squareSizeIncrement = GRID_CONSTANTS.defaultSide;
    for (let num = 1; num <= GRID_CONSTANTS.rowColumnCount; num++) {
        COLUMNS[num] = squareSizeIncrement;
        squareSizeIncrement += GRID_CONSTANTS.defaultSide;
    }
};

setCoordinates();
export const COLOUR_COORDINATES = {
    lightBlueCoordinates: [
        [ROWS.A, COLUMNS[4]],
        [ROWS.A, COLUMNS[12]],
        [ROWS.C, COLUMNS[7]],
        [ROWS.C, COLUMNS[9]],
        [ROWS.D, COLUMNS[1]],
        [ROWS.D, COLUMNS[8]],
        [ROWS.D, COLUMNS[15]],
        [ROWS.G, COLUMNS[3]],
        [ROWS.G, COLUMNS[7]],
        [ROWS.G, COLUMNS[9]],
        [ROWS.G, COLUMNS[13]],
        [ROWS.H, COLUMNS[4]],
        [ROWS.H, COLUMNS[12]],
        [ROWS.I, COLUMNS[3]],
        [ROWS.I, COLUMNS[7]],
        [ROWS.I, COLUMNS[9]],
        [ROWS.I, COLUMNS[13]],
        [ROWS.L, COLUMNS[1]],
        [ROWS.L, COLUMNS[8]],
        [ROWS.L, COLUMNS[15]],
        [ROWS.M, COLUMNS[7]],
        [ROWS.M, COLUMNS[9]],
        [ROWS.O, COLUMNS[4]],
        [ROWS.O, COLUMNS[12]],
    ],
    blueCoordinates: [
        [ROWS.B, COLUMNS[6]],
        [ROWS.B, COLUMNS[10]],
        [ROWS.F, COLUMNS[2]],
        [ROWS.F, COLUMNS[6]],
        [ROWS.F, COLUMNS[10]],
        [ROWS.F, COLUMNS[14]],
        [ROWS.J, COLUMNS[2]],
        [ROWS.J, COLUMNS[6]],
        [ROWS.J, COLUMNS[10]],
        [ROWS.J, COLUMNS[14]],
        [ROWS.N, COLUMNS[6]],
        [ROWS.N, COLUMNS[10]],
    ],
    pinkCoordinates: [
        [ROWS.B, COLUMNS[2]],
        [ROWS.B, COLUMNS[14]],
        [ROWS.C, COLUMNS[3]],
        [ROWS.C, COLUMNS[13]],
        [ROWS.D, COLUMNS[4]],
        [ROWS.D, COLUMNS[12]],
        [ROWS.E, COLUMNS[5]],
        [ROWS.E, COLUMNS[11]],
        [ROWS.H, COLUMNS[8]],
        [ROWS.K, COLUMNS[5]],
        [ROWS.K, COLUMNS[11]],
        [ROWS.L, COLUMNS[4]],
        [ROWS.L, COLUMNS[12]],
        [ROWS.M, COLUMNS[3]],
        [ROWS.M, COLUMNS[13]],
        [ROWS.N, COLUMNS[2]],
        [ROWS.N, COLUMNS[14]],
    ],
    redCoordinates: [
        [ROWS.A, COLUMNS[1]],
        [ROWS.A, COLUMNS[8]],
        [ROWS.A, COLUMNS[15]],
        [ROWS.H, COLUMNS[1]],
        [ROWS.H, COLUMNS[15]],
        [ROWS.O, COLUMNS[1]],
        [ROWS.O, COLUMNS[8]],
        [ROWS.O, COLUMNS[15]],
    ],
};
