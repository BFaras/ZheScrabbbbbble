// Account creation error codes
export const NO_ERROR = '0';
export const USERNAME_INVALID = '1';
export const EMAIL_INVALID = '2';
export const PASSWORD_INVALID = '3';
export const USERNAME_TAKEN = '4';
export const DATABASE_UNAVAILABLE = '5';

// Password reset error codes
export const WRONG_SECURITY_ANSWER = '6';

// Room management error codes
export const ROOM_NAME_TAKEN = 'ROOM-1';
export const ROOM_PASSWORD_INCORRECT = 'ROOM-2';
export const JOIN_REQUEST_REFUSED = 'ROOM-3';
export const ROOM_IS_FULL = 'ROOM-4';

// Game error codes
export const UNKNOWN_ACTION = 'GAME-1';
export const NOT_YOUR_TURN = 'GAME-2';
export const NOT_IN_GAME = 'GAME-3';
export const INVALID_COMMAND_SYNTAX = 'GAME-4';
export const ILLEGAL_COMMAND = 'GAME-5';

// Friends error codes
export const WRONG_FRIEND_CODE = 'FRIEND-1';

// General errors
export const INVALID_DATA_SENT = 'GEN-1';
export const NO_USER_CONNECTED = 'GEN-2';
