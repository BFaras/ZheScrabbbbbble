/* eslint-disable @typescript-eslint/naming-convention */
export const LETTER_POINTS = {
    A: 1,
    B: 3,
    C: 3,
    D: 2,
    E: 1,
    F: 4,
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 10,
    L: 1,
    M: 2,
    N: 1,
    O: 1,
    P: 3,
    Q: 8,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    V: 4,
    W: 10,
    X: 10,
    Y: 10,
    Z: 10,
    BLANK: 0,
};

export const TILE_COLORS_CLASSIC = {
    textColour: '#520000',
    backgroundColour: '#ECE7DD',
    selectionColour: 'rgb(101, 5, 5, 0.5)',
    manipulationColor: 'rgb(29, 73, 2, 0.5)',
};

export const TILE_COLORS_INVERTED = {
    textColour: '#adffff',
    backgroundColour: '#131822',
    selectionColour: 'rgb(154, 250, 250, 0.5)',
    manipulationColor: 'rgb(226, 182, 253, 0.5)',
};

export const HOLDER_MEASUREMENTS = {
    tileSide: 60,
    defaultLetterSize: 27,
    defaultPointsSize: 17,
    borderWidth: 1,
    spaceBetween: 10,
    holderWidth: 480, // 60 * 7 tiles + 10 * 6 spaces between the tiles
    holderHeight: 60,
    maxPositionHolder: 7,
    minPositionHolder: 1,
    letterOffsetH: 2.2,
    letterOffsetV: 1.5,
    pointOffsetH: 1.4,
    pointOffsetV: 1.8,
};

export const TILES: { [key: string]: number[] } = {};
export const isSelected: { [key: string]: boolean } = {};
export const isManipulated: { [key: string]: boolean } = {};

const setCoordinatesLetterHolder = () => {
    let initialPosition = 10;
    const tileSizeIncrement: number = HOLDER_MEASUREMENTS.tileSide;

    for (let position: number = HOLDER_MEASUREMENTS.minPositionHolder; position <= HOLDER_MEASUREMENTS.maxPositionHolder; position++) {
        TILES[position] = [initialPosition, initialPosition + tileSizeIncrement];
        initialPosition += tileSizeIncrement + HOLDER_MEASUREMENTS.spaceBetween;
    }
};

const setSelection = () => {
    for (let position = HOLDER_MEASUREMENTS.minPositionHolder; position <= HOLDER_MEASUREMENTS.maxPositionHolder; position++) {
        isSelected[position] = false;
    }
};

const setManipulation = () => {
    for (let position = HOLDER_MEASUREMENTS.minPositionHolder; position <= HOLDER_MEASUREMENTS.maxPositionHolder; position++) {
        isManipulated[position] = false;
    }
};

setCoordinatesLetterHolder();
setSelection();
setManipulation();
