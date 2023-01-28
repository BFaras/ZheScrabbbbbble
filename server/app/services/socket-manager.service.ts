import { GameRoom } from '@app/classes/game-room';
import { GameSettings } from '@app/classes/game-settings';
import { Player } from '@app/classes/player';
import { CommandDetails, VirtualPlayer } from '@app/classes/virtual-player';
import { VirtualPlayerEasy } from '@app/classes/virtual-player-easy';
import { VirtualPlayerHard } from '@app/classes/virtual-player-hard';
import { ErrorType } from '@app/constants/basic-constants';
import { GameState, Message } from '@app/constants/basic-interface';
import {
    COLOR_OTHER_PLAYER,
    COLOR_SYSTEM,
    DEFAULT_COLOR,
    ILLEGAL_COMMAND_ERROR,
    INVALID_SYNTAX_ERROR,
    RECONNECT_TIME,
} from '@app/constants/communication-constants';
import { PlayerName, VirtualPlayerDifficulty } from '@app/constants/database-interfaces';
import { CommandController, CommandResult } from '@app/controllers/command.controller';
import { RoomManagerService } from '@app/services/room-manager.service';
import * as http from 'http';
import * as io from 'socket.io';
import { DatabaseService } from './database.service';
import { SocketDatabaseService } from './socket-database.service';

export class SocketManager {
    private sio: io.Server;
    private roomManager: RoomManagerService;
    private commandController: CommandController;
    private socketDatabaseService: SocketDatabaseService;
    private databaseService: DatabaseService;
    private timeoutRoom: { [key: string]: NodeJS.Timeout };

    constructor(server: http.Server, databaseService: DatabaseService) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.socketDatabaseService = new SocketDatabaseService(databaseService);
        this.databaseService = databaseService;
        this.timeoutRoom = {};
    }

    async roomManagerSetup() {
        this.roomManager = new RoomManagerService(await this.socketDatabaseService.getDictionary());
        this.commandController = new CommandController(this.roomManager);
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            this.socketDatabaseService.databaseSocketRequests(socket);

            socket.on('new-message', (message: Message) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                const messageHead = message.username === '[SERVER]' ? message.username : currentRoom?.getPlayer(socket.id, false)?.getName();
                socket.emit('new-message', {
                    username: messageHead,
                    body: message.body,
                    color: message.username === '[SERVER]' ? COLOR_SYSTEM : DEFAULT_COLOR,
                });
                if (messageHead !== '[SERVER]')
                    socket
                        .to((currentRoom as GameRoom).getName())
                        .emit('new-message', { username: messageHead, body: message.body, color: COLOR_OTHER_PLAYER });
            });

            socket.on('command', (command: string, argument: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom || currentRoom.getGame.isGameOver()) return;
                const roomName = currentRoom?.getName() as string;
                const returnValue = this.commandController.executeCommand({ commandType: command, args: argument, playerID: socket.id });
                if (returnValue.errorType !== undefined) {
                    socket.emit('new-message', this.handleError(returnValue.errorType as ErrorType));
                    return;
                }
                socket.emit('new-message', {
                    username: '[SERVER]',
                    body: `${currentRoom.getPlayer(socket.id, false)?.getName()} ${returnValue.activePlayerMessage}`,
                    color: COLOR_SYSTEM,
                });
                if (returnValue.otherPlayerMessage === 'NotEndTurn') return;
                socket.to(roomName).emit('new-message', {
                    username: '[SERVER]',
                    body: `${currentRoom.getPlayer(socket.id, false)?.getName()} ${returnValue.otherPlayerMessage}`,
                    color: COLOR_SYSTEM,
                });
                this.sendEndGameMessage(returnValue, roomName);
                this.sendGameState(currentRoom, socket);
            });

            socket.on('joinRoom', (username: string, room: string) => {
                this.roomManager.addPlayer(new Player(socket.id, username), room);
                socket.join(room);
                socket.to(room).emit('guestPlayerIsWaiting', username, true);
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) socket.to(room).emit('timeChosen', currentRoom.getTimeChosen());
            });

            socket.on('createMultiRoom', async (gameSettings: GameSettings) => {
                if (this.roomManager.verifyIfRoomExists(gameSettings.roomName)) {
                    socket.emit('error-room-name');
                    return;
                }
                this.roomManager.createRoom(gameSettings, (await this.socketDatabaseService.getDictionary(gameSettings.dictionary)).words);
                const newUser = new Player(socket.id, gameSettings.hostPlayerName);
                this.roomManager.addPlayer(newUser, gameSettings.roomName);
                socket.join(gameSettings.roomName);
                socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
            });

            socket.on('createSoloRoom', async (gameSettings: GameSettings) => {
                const roomName = this.roomManager.createSoloRoomName();
                gameSettings.roomName = roomName;
                this.roomManager.createRoom(gameSettings, (await this.socketDatabaseService.getDictionary(gameSettings.dictionary)).words);
                const soloUser = new Player(socket.id, gameSettings.hostPlayerName);
                this.roomManager.addPlayer(soloUser, roomName);
                socket.join(roomName);
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                let vpName = '';
                if (gameSettings.virtualPlayerName) vpName = gameSettings.virtualPlayerName;
                const virtualUser = gameSettings.isEasyMode ? new VirtualPlayerEasy(vpName, currentRoom) : new VirtualPlayerHard(vpName, currentRoom);
                this.roomManager.addPlayer(virtualUser, roomName);
                socket.emit('soloRoomIsReady');
            });

            socket.on('disconnect', async () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                if (currentRoom.getGame.isGameOver()) {
                    this.roomManager.removePlayer(socket.id, currentRoom.getName());
                    return;
                }
                socket.leave(currentRoom.getName());
                this.sio.to(currentRoom.getName()).emit('new-message', {
                    username: '[SERVER]',
                    body: `${currentRoom?.getPlayer(socket.id, false)?.getName()} s'est déconnecté.`,
                    color: COLOR_SYSTEM,
                });
                const timeout = await setTimeout(async () => {
                    await this.disconnectPlayer(currentRoom, socket);
                }, RECONNECT_TIME);
                this.timeoutRoom[currentRoom.getName()] = timeout;
            });

            socket.on('abandon', async () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                if (currentRoom.getGame.isGameOver()) {
                    this.roomManager.removePlayer(socket.id, currentRoom.getName());
                    return;
                }
                this.sio.to(currentRoom.getName()).emit('new-message', {
                    username: '[SERVER]',
                    body: `${currentRoom.getPlayer(socket.id, false)?.getName()} a abandonné et quitté la partie.`,
                    color: COLOR_SYSTEM,
                });
                await this.disconnectPlayer(currentRoom, socket);
            });

            socket.on('reconnect', (id: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(id);
                if (!currentRoom) return;
                currentRoom.getPlayer(id, false)?.setUUID(socket.id);
                if (!currentRoom.getIsSoloGame() && currentRoom.isPlayerTurn(socket.id)) currentRoom.getGame.swapActivePlayer();
                const roomName = currentRoom.getName();
                clearTimeout(this.timeoutRoom[roomName]);
                delete this.timeoutRoom[roomName];
                socket.join(roomName);
                this.sendGameState(currentRoom, socket);
            });

            socket.on('sendWaitingRooms', () => {
                socket.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
            });

            socket.on('answerGuestPlayer', (room: string, accepted: boolean, message: string) => {
                if (accepted) {
                    socket.to(room).emit('guestAnswered', accepted, message);
                    return;
                }
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) this.roomManager.removePlayer(currentRoom?.getPlayerFromIndex(1)?.getUUID(), room);
            });

            socket.on('deleteRoom', (room: string) => {
                this.roomManager.deleteRoom(room);
                socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
            });

            socket.on('guestPlayerLeft', (room: string) => {
                socket.to(room).emit('guestPlayerIsWaiting', '', false);
            });

            socket.on('getPlayerNames', () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                const names: string[] = [];
                const yourName = currentRoom.getPlayer(socket.id, false)?.getName();
                const opponentName = currentRoom.getIsSoloGame()
                    ? currentRoom.getPlayerFromIndex(1)?.getName()
                    : currentRoom.getPlayer(socket.id, true)?.getName();
                names.push(yourName ? yourName : '');
                names.push(opponentName ? opponentName : '');
                socket.emit('playerNames', names);
                socket
                    .to(currentRoom.getName())
                    .emit('new-message', { username: '[SERVER]', body: `${yourName} vient de joindre la partie.`, color: COLOR_SYSTEM });
                if (currentRoom.getIsSoloGame()) currentRoom.incrementConnectedPlayers();
                if (currentRoom.incrementConnectedPlayers()) {
                    currentRoom.getGame.startGame();
                    this.sendGameState(currentRoom, socket);
                }
            });

            socket.on('gameStateReceived', () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom && currentRoom.getIsSoloGame()) this.virtualPlay(currentRoom, socket);
            });

            socket.on('sendTimer', () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) socket.emit('hereIsTheTimer', currentRoom.getTimeChosen());
            });

            socket.on('requestId', () => {
                socket.emit('sendID', socket.id);
            });

            socket.on('sendCurrentSettings', () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) socket.emit('hereAreTheSettings', currentRoom.getPlayerFromIndex(0).getName(), currentRoom.getTimeChosen());
            });
        });
    }

    handleError(errorType: ErrorType) {
        switch (errorType) {
            case ErrorType.IllegalCommand:
                return ILLEGAL_COMMAND_ERROR;
            case ErrorType.InvalidSyntax:
                return INVALID_SYNTAX_ERROR;
        }
    }

    async disconnectPlayer(currentRoom: GameRoom, socket: io.Socket) {
        if (currentRoom.getPlayerCount() === 1) {
            this.roomManager.removePlayer(socket.id, currentRoom.getName());
            return;
        }
        if (currentRoom.getIsSoloGame()) {
            currentRoom.getGame.endGame();
            this.sendGameState(currentRoom as GameRoom, socket, true);
            currentRoom.removeVirtualPlayers();
            this.roomManager.removePlayer(socket.id, currentRoom.getName());
            return;
        }
        const names: PlayerName[] | undefined = this.databaseService.database
            ? await this.databaseService.getPlayerNameList(VirtualPlayerDifficulty.BEGINNER)
            : undefined;
        const playerName: string = names ? names[Math.floor(Math.random() * names.length)].name : 'Michel Gagnon';
        this.sio.in(currentRoom.getName()).emit('new-message', {
            username: '[SERVER]',
            body: `Le joueur virtuel débutant ${playerName} a rejoint votre partie`,
            color: COLOR_SYSTEM,
        });
        this.sio.in(currentRoom.getName()).emit('playerNames', [currentRoom.getPlayer(socket.id, true)?.getName(), playerName]);
        if (currentRoom.getPlayer(socket.id, false)?.hasTurn()) currentRoom.getGame.swapActivePlayer();
        currentRoom.convertSoloGame(socket.id, new VirtualPlayerEasy(playerName, currentRoom));
        this.sendGameState(currentRoom as GameRoom, socket, true);
    }

    virtualPlay(room: GameRoom, socket: io.Socket) {
        const activePlayer: Player = room.getPlayerFromIndex(room.getPlayerIndex(true));
        if (!(activePlayer instanceof VirtualPlayer) || room.getGame.isGameOver() || activePlayer.isPlaying) return;
        const commandDetails: CommandDetails = activePlayer.play();
        socket.emit('new-message', {
            username: activePlayer.getName(),
            body: `${commandDetails.command}`,
            color: COLOR_OTHER_PLAYER,
        });
        socket.emit('new-message', {
            username: '[SERVER]',
            body: `${activePlayer.getName()} ${commandDetails.result.otherPlayerMessage}`,
            color: COLOR_SYSTEM,
        });
        this.sendEndGameMessage(commandDetails.result, room.getName());
        this.sendGameState(room, socket);
        activePlayer.endPlay();
    }

    sendEndGameMessage(commandResult: CommandResult, roomName: string) {
        if (commandResult.endGameMessage !== undefined)
            this.sio.in(roomName).emit('new-message', { username: '[SERVER]', body: commandResult.endGameMessage, color: COLOR_SYSTEM });
    }

    private sendGameState(currentRoom: GameRoom, socket: io.Socket | undefined, disconnect: boolean = false) {
        const previousPlayerNumber = currentRoom?.getPlayerIndex(false);
        const nextPlayerNumber = currentRoom?.getPlayerIndex(true);
        const gameStateActive: GameState = currentRoom?.getGame.createGameState(previousPlayerNumber);
        const gameStateOther: GameState = currentRoom?.getGame.createGameState(nextPlayerNumber);
        const isYourTurn = socket ? currentRoom.isPlayerTurn(socket.id) : true;
        if (gameStateActive.gameOver) {
            this.socketDatabaseService.sendGameHistoryToDatabase(
                currentRoom.getGame.createGameHistory(
                    gameStateActive.yourScore >= gameStateActive.opponentScore ? previousPlayerNumber : nextPlayerNumber,
                ),
            );
            const activeScore = {
                username: currentRoom.getPlayerFromIndex(previousPlayerNumber).getName(),
                score: gameStateActive.yourScore,
            };
            const otherScore = {
                username: currentRoom.getPlayerFromIndex(nextPlayerNumber).getName(),
                score: gameStateActive.opponentScore,
            };
            this.socketDatabaseService.sendScoreToDatabase(
                isYourTurn ? otherScore : activeScore,
                isYourTurn ? activeScore : otherScore,
                disconnect,
                currentRoom.getIsSoloGame(),
                currentRoom.getGame.getGameType(),
            );
        }
        if (!socket) return;
        socket.to(currentRoom.getName()).emit('game-state', isYourTurn ? gameStateActive : gameStateOther);
        socket.emit('game-state', isYourTurn ? gameStateOther : gameStateActive);
    }
}
