export interface Theme {
    name: string;
    properties: any;
}

export const classic: Theme = {
    name: "classic",
    properties: {
        "--accent-default": "#cb654f",
        "--playarea-motx2": "#d3b1a7",
        "--playarea-motx3": "#cb654f",
        "--playarea-letterx2": "#8cbea3",
        "--playarea-letterx3": "#679089",
        "--playarea-background": "white",
        "--playarea-coords": "#520000",
        "--playarea-grid": "black",

        "--background-default": "#f7eddf",
        "--background-secondary": " #fffbfb",
        "--background-tertiary": "#d7e0cd",
        "--background-quaternary": "#faf5f1",

        "--text-default": "black",
        "--text-secondary": "#001d7e",
        "--input-highlight": "#cfd8c4",

        "--button-text-default": "#5e5e5e",
        "--button-text-hover": "black",

        "--button-primary": "#cce0b7",
        "--button-primary-hover": "#bacc7a",

        "--button-secondary": "#d3b1a7",
        "--button-secondary-hover": "#ce8975",

        "--button-tertiary": "#a5c2b2",
        "--button-tertiary-hover": "#8cbea3",

        "--button-quaternary": "#cfcb9c",
        "--button-quaternary-hover": "#cea261",

        "--scroll-default": "#8cbea3",
        "--scroll-background": "#f1f1f1",
        "--scroll-hover": "#cb654f",

        "--tile-on-board": "#cfcb9c",
        "--tile-on-holder": "#ECE7DD",

        "--box-shadow": "0 1.8px 1.2px rgba(0, 0, 0, 0.096), 0 5.7px 4.3px rgba(0, 0, 0, 0.103), 0 8.5px 7px rgba(0, 0, 0, 0.11)"
    }
};

export const inverted: Theme = {
    name: "inverted",
    properties: {
        "--accent-default": "#349ab0",
        "--playarea-motx2": "#2c4e58",
        "--playarea-motx3": "#349ab0",
        "--playarea-letterx2": "#73415c",
        "--playarea-letterx3": "#986f76",
        "--playarea-background": "black",
        "--playarea-coords": "#adffff",
        "--playarea-grid": "white",

        "--background-default": "#0b1b30",
        "--background-secondary": "#0e0e0e",
        "--background-tertiary": "#281f32",
        "--background-quaternary": "#050a0e",

        "--text-default": "white",
        "--text-secondary": "#ffe281",
        "--input-highlight": "#281f32",

        "--button-text-default": "#a1a1a1",
        "--button-text-hover": "white",

        "--button-primary": "#331f48",
        "--button-primary-hover": "#453385",

        "--button-secondary": "#2c4e58",
        "--button-secondary-hover": "#31768a",

        "--button-tertiary": "#5a3d4d",
        "--button-tertiary-hover": "#73415c",

        "--button-quaternary": "#303463",
        "--button-quaternary-hover": "#315d9e",

        "--scroll-default": "#73415c",
        "--scroll-background": "#0e0e0e",
        "--scroll-hover": "#349ab0",

        "--tile-on-board": "#303463",
        "--tile-on-holder": "#131822",

        "--box-shadow": "0 1.8px 1.2px rgba(0, 0, 0, 0.096), 0 5.7px 4.3px rgba(0, 0, 0, 0.103), 0 8.5px 7px rgba(0, 0, 0, 0.11)"
    }
};