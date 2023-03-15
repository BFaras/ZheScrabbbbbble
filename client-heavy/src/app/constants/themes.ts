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
        "--background-secondary": "#201f1f",
        "--background-tertiary": "#281f32",
        "--background-quaternary": "#050a0e",

        "--text-default": "white",
        "--text-secondary": "#ffe281",
        "--input-highlight": "#271d32",

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

        "--box-shadow": "0 1.8px 1.2px rgba(0, 0, 0, 0.2), 0 5.7px 4.3px rgba(0, 0, 0, 0.25), 0 8.5px 7px rgba(0, 0, 0, 0.28)"
    }
};

export const green: Theme = {
    name: "green",
    properties: {
        "--accent-default": "#89b034",
        "--playarea-motx2": "#3d582c",
        "--playarea-motx3": "#89b034",
        "--playarea-letterx2": "#4c7341",
        "--playarea-letterx3": "#74986f",
        "--playarea-background": "black",
        "--playarea-coords": "#cdffad",
        "--playarea-grid": "white",

        "--background-default": "#19300b",
        "--background-secondary": "#122912",
        "--background-tertiary": "#1f321f",
        "--background-quaternary": "#0b1c09",

        "--text-default": "white",
        "--text-secondary": "#c7ff81",
        "--input-highlight": "#1e301e",

        "--button-text-default": "#cbe4c9",
        "--button-text-hover": "white",

        "--button-primary": "#5a7b4f",
        "--button-primary-hover": "#4f8533",

        "--button-secondary": "#37582c",
        "--button-secondary-hover": "#488a31",

        "--button-tertiary": "#489826",
        "--button-tertiary-hover": "#3ca70f",

        "--button-quaternary": "#0e5600",
        "--button-quaternary-hover": "#0b4300",

        "--scroll-default": "#417344",
        "--scroll-background": "#0e0e0e",
        "--scroll-hover": "#6eb034",

        "--tile-on-board": "#396330",
        "--tile-on-holder": "#142213",

        "--box-shadow": "0 1.8px 1.2px rgba(0, 0, 0, 0.2), 0 5.7px 4.3px rgba(0, 0, 0, 0.25), 0 8.5px 7px rgba(0, 0, 0, 0.28)"
    }
};

export const pink: Theme = {
    name: "pink",
    properties: {
        "--accent-default": "#cb4f7f",
        "--playarea-motx2": "#d3a7bc",
        "--playarea-motx3": "#cb4f7f",
        "--playarea-letterx2": "#be8caa",
        "--playarea-letterx3": "#a75c8c",
        "--playarea-background": "white",
        "--playarea-coords": "#520027",
        "--playarea-grid": "black",

        "--background-default": "#f7dfed",
        "--background-secondary": " #fffbfb",
        "--background-tertiary": "#e0cddc",
        "--background-quaternary": "#faf1fa",

        "--text-default": "black",
        "--text-secondary": "#7e0062",
        "--input-highlight": "#d8c4d2",

        "--button-text-default": "#5e5e5e",
        "--button-text-hover": "black",

        "--button-primary": "#e0b7ce",
        "--button-primary-hover": "#cc7aa4",

        "--button-secondary": "#d3a7bc",
        "--button-secondary-hover": "#cb4f7f",

        "--button-tertiary": "#c2a5b6",
        "--button-tertiary-hover": "#be8cb1",

        "--button-quaternary": "#cf9cad",
        "--button-quaternary-hover": "#ce619e",

        "--scroll-default": "#be8cb1",
        "--scroll-background": "#f7dfed",
        "--scroll-hover": "#cb4f7f",

        "--tile-on-board": "#cf9cb2",
        "--tile-on-holder": "#f7dfed",

        "--box-shadow": "0 1.8px 1.2px rgba(0, 0, 0, 0.096), 0 5.7px 4.3px rgba(0, 0, 0, 0.103), 0 8.5px 7px rgba(0, 0, 0, 0.11)"
    }
};