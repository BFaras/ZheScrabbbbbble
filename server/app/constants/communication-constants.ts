import { Message } from './basic-interface';

export const COLOR_SYSTEM = '#cb654f';
export const COLOR_OTHER_PLAYER = '#679089';
export const DEFAULT_COLOR = 'black';

export const DISCONNECT_SCORE = -1000;
export const RECONNECT_TIME = 5000;

export const ILLEGAL_COMMAND_ERROR: Message = {
    username: '[SERVER]',
    body: 'Commande impossible à réaliser',
    color: COLOR_SYSTEM,
};

export const INVALID_SYNTAX_ERROR: Message = {
    username: '[SERVER]',
    body: 'Entrée invalide',
    color: COLOR_SYSTEM,
};
