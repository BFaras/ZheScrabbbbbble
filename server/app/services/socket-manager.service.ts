import { GameRoom } from '@app/classes/game-room';
import { Player } from '@app/classes/player';
import { GameStatus } from '@app/classes/tournament';
import { VirtualPlayerEasy } from '@app/classes/virtual-player-easy';
import { VirtualPlayerHard } from '@app/classes/virtual-player-hard';
import { MAX_NUMBER_OF_PLAYERS, RoomVisibility, TOURNAMENT_SIZE } from '@app/constants/basic-constants';
import { JOIN_REQUEST_REFUSED, NO_ERROR, ROOM_IS_FULL, ROOM_NAME_TAKEN, ROOM_PASSWORD_INCORRECT } from '@app/constants/error-code-constants';
import { DISCONNECT_MESSAGE, END_GAME_MESSAGE, OUT_OF_TIME_MESSAGE, REPLACED_MESSAGE, ROUND_OVER_MESSAGE, ROUND_TIME_LEFT_MESSAGE } from '@app/constants/game-state-constants';
import { CommandController, CommandResult, PlayerMessage } from '@app/controllers/command.controller';
import * as http from 'http';
import * as io from 'socket.io';
import Container from 'typedi';
import { AccountInfoService } from './account-info.service';
import { AuthSocketService } from './auth-socket.service';
import { ChatSocketService } from './chat-socket.service';
import { FriendSocketService } from './friend-socket.service';
import { ProfileSocketService } from './profile-socket.service';
import { RoomManagerService } from './room-manager.service';
import { SocketDatabaseService } from './socket-database.service';
import { UsersStatusService } from './users-status.service';

export const VIRTUAL_PLAYER_NAMES = ['Michel Gagnon', 'Eve', 'John', 'Diane', 'Alex', 'Mike', 'Emma'];

export class SocketManager {
    private sio: io.Server;
    private roomManager: RoomManagerService;
    private commandController: CommandController;
    private socketDatabaseService: SocketDatabaseService;
    private chatSocketService: ChatSocketService;
    private authSocketService: AuthSocketService;
    private usersStatusService: UsersStatusService;
    private accountInfoService: AccountInfoService;
    private profileSocketService: ProfileSocketService;
    private friendSocketService: FriendSocketService;
    private pendingJoinGameRequests: Map<string, [string, io.Socket, boolean]>;
    private tournamentQueue: io.Socket[];


    constructor(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.socketDatabaseService = new SocketDatabaseService();
        this.chatSocketService = new ChatSocketService();
        this.authSocketService = new AuthSocketService();
        this.accountInfoService = Container.get(AccountInfoService);
        this.usersStatusService = Container.get(UsersStatusService);
        this.roomManager = Container.get(RoomManagerService);
        this.profileSocketService = Container.get(ProfileSocketService);
        this.friendSocketService = Container.get(FriendSocketService);
        this.pendingJoinGameRequests = new Map<string, [string, io.Socket, boolean]>();
        this.commandController = new CommandController(this.roomManager);
        this.friendSocketService.setSio(this.sio);
        this.tournamentQueue = [];
    }

    handleSockets(): void {
        this.sio.on('connection', (socket: io.Socket) => {
            console.log(new Date().toLocaleTimeString() + ' | New device connection to server');
            this.socketDatabaseService.databaseSocketRequests(socket);
            this.chatSocketService.handleChatSockets(socket);
            this.authSocketService.handleAuthSockets(socket);
            this.profileSocketService.handleProfileSockets(socket);
            this.friendSocketService.handleFriendSockets(socket);

            socket.on('Create Game Room', async (name: string, visibility: RoomVisibility, password?: string) => {
                if (visibility === RoomVisibility.Tournament) return;
                console.log(new Date().toLocaleTimeString() + ' | Room creation request received');
                if (this.roomManager.verifyIfRoomExists(name)) {
                    console.log(new Date().toLocaleTimeString() + ' | Error in room creation, name taken');
                    socket.emit('Room Creation Response', ROOM_NAME_TAKEN);
                    return;
                }
                const roomId = this.roomManager.createRoom(name, visibility, password);
                const newUser = new Player(socket.id, this.accountInfoService.getUsername(socket));
                this.roomManager.addPlayer(roomId, newUser);
                socket.join(roomId);
                console.log(new Date().toLocaleTimeString() + ' | New ' + visibility + ' room created');
                socket.emit('Room Creation Response', NO_ERROR, roomId);
                socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
            });

            socket.on('Get Game Room List', () => {
                socket.emit('Game Room List Response', this.roomManager.getGameRooms());
            });

            socket.on('Join Game Room', (roomCode: string, observer: boolean, password?: string) => {
                console.log(new Date().toLocaleTimeString() + ' | Room join request received');
                const username = this.accountInfoService.getUsername(socket);
                if (!observer && this.roomManager.isRoomFull(roomCode)) {
                    console.log(new Date().toLocaleTimeString() + ' | Room is full');
                    socket.emit('Join Room Response', ROOM_IS_FULL);
                    return;
                }
                /** PRIVATE*/
                if (this.roomManager.getRoomVisibility(roomCode) === RoomVisibility.Private) {
                    this.pendingJoinGameRequests.set(username, [roomCode, socket, observer]);
                    console.log(new Date().toLocaleTimeString() + ' | Room is private. Request sent to host');
                    this.sio.to(this.roomManager.getRoomHost(roomCode).getUUID()).emit('Join Room Request', username, observer);
                    return;
                }
                /** PROTECTED */
                if (!this.roomManager.verifyPassword(roomCode, password)) {
                    console.log(new Date().toLocaleTimeString() + ' | Room is protected. Incorrect room password');
                    socket.emit('Join Room Response', ROOM_PASSWORD_INCORRECT);
                    return;
                }
                /** PUBLIQUE */
                console.log(new Date().toLocaleTimeString() + ' | Room joined successfully');
                socket.join(roomCode);
                if (!observer) {
                    this.roomManager.addPlayer(roomCode, new Player(socket.id, username));
                } else {
                    this.roomManager.addObserver(roomCode, socket.id)
                }
                const playerNames = this.roomManager.getRoomPlayerNames(roomCode);
                if (!observer) {
                    socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                    socket.to(roomCode).emit('Room Player Update', playerNames);
                }
                socket.emit('Join Room Response', NO_ERROR, playerNames);
            });

            socket.on('Join Request Response', (response: boolean, username: string) => {
                const requestInfo = this.pendingJoinGameRequests.get(username);
                this.pendingJoinGameRequests.delete(username);
                if (!requestInfo) return;
                if (!response) {
                    console.log(new Date().toLocaleTimeString() + ' | Join request refused');
                    requestInfo[1].emit('Join Room Response', JOIN_REQUEST_REFUSED);
                    return;
                }
                console.log(new Date().toLocaleTimeString() + ' | Join request accepted');
                requestInfo[1].join(requestInfo[0]);
                if (!requestInfo[2]) {
                    this.roomManager.addPlayer(requestInfo[0], new Player(requestInfo[1].id, username));
                } else {
                    this.roomManager.addObserver(requestInfo[0], requestInfo[1].id);
                }
                const playerNames = this.roomManager.getRoomPlayerNames(requestInfo[0]);
                if (!requestInfo[2]) {
                    socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                    requestInfo[1].to(requestInfo[0]).emit('Room Player Update', playerNames);
                }
                requestInfo[1].emit('Join Room Response', NO_ERROR, playerNames);
            });

            socket.on('Cancel Join Request', () => {
                this.pendingJoinGameRequests.delete(this.accountInfoService.getUsername(socket));
            });

            socket.on('Is Game Started', () => {
                const room = this.roomManager.findRoomFromPlayer(socket.id);
                if (!room) return;
                socket.emit('Is Game Started Response', room.isGameStarted());
            })

            socket.on('Leave Game Room', () => {
                const room = this.roomManager.findRoomFromPlayer(socket.id);
                if (!room) return;
                const isPlayer = room.removePlayer(socket.id);
                socket.leave(room.getID());
                if (!isPlayer) return;
                if (room.getPlayerCount() === 0) {
                    this.roomManager.deleteRoom(room.getID());
                    return;
                }
                const playerNames = this.roomManager.getRoomPlayerNames(room.getID());
                socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                socket.to(room.getID()).emit('Room Player Update', playerNames);
            });

            socket.on('Start Game', async () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                if (currentRoom.getHostPlayer().getName() !== this.accountInfoService.getUsername(socket)) return;
                const playerCount = currentRoom.getPlayerCount()
                if (playerCount < 2) return;
                if (currentRoom.isGameStarted()) return;
                for (let i = 0; i < MAX_NUMBER_OF_PLAYERS - playerCount; i++) {
                    let name;
                    let index;
                    do {
                        index = Math.floor(Math.random() * VIRTUAL_PLAYER_NAMES.length);
                        name = VIRTUAL_PLAYER_NAMES[index];
                    } while (currentRoom.getPlayerNames().includes(name) || currentRoom.getPlayerNames().includes(name + ' (V)'))
                    let virtualPlayer;
                    if (index === 0) {
                        virtualPlayer = new VirtualPlayerHard(name + ' (V)', currentRoom)
                    } else {
                        virtualPlayer = new VirtualPlayerEasy(name + ' (V)', currentRoom)
                    }
                    currentRoom.addPlayer(virtualPlayer);
                }
                currentRoom.startGame(this.timerCallback.bind(this));
                console.log(new Date().toLocaleTimeString() + ' | New game started');
                socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                socket.to(currentRoom.getID()).emit('Game Started');
                socket.emit('Game Started');
                this.playVirtualTurns(currentRoom);
            });

            socket.on('Request Game State', () => {
                console.log(new Date().toLocaleTimeString() + ' | Game state requested');
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                console.log(new Date().toLocaleTimeString() + ' | Game state sent');
                socket.emit('Game State Update', currentRoom.getGame.createGameState());
            });

            socket.on('Play Turn', async (command: string, argument: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom || currentRoom.getGame.isGameOver()) return;
                let returnValue = this.commandController.executeCommand({ commandType: command, args: argument, playerID: socket.id });
                this.sendGameState(currentRoom, returnValue.playerMessage);
                if (returnValue.endGameMessage) {
                    this.sendGameState(currentRoom, { messageType: END_GAME_MESSAGE, values: [returnValue.endGameMessage] });
                    if (currentRoom.getVisibility() === RoomVisibility.Tournament) {
                        const tournament = this.roomManager.findTournamentFromPlayer(this.accountInfoService.getUsername(socket));
                        if (!tournament) return;
                        tournament.setGameWinner(currentRoom.getID(), currentRoom.getGame.getWinner());
                        this.sio.in(tournament.getID()).emit('Tournament Data Response', tournament.getGameData(), tournament.getTimePhase());
                    }
                }
                this.playVirtualTurns(currentRoom);
            });

            socket.on('Abandon', async () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                socket.leave(currentRoom.getID());
                if (currentRoom.isPlayerObserver(socket.id)) {
                    currentRoom.removeObserver(socket.id);
                    return;
                }
                if (currentRoom.getVisibility() === RoomVisibility.Tournament) {
                    if (!currentRoom.getGame.isGameOver()) {
                        const message = currentRoom.getGame.endGame();
                        this.sendGameState(currentRoom, { messageType: DISCONNECT_MESSAGE, values: [this.accountInfoService.getUsername(socket)] });
                        this.sendGameState(currentRoom, { messageType: END_GAME_MESSAGE, values: [message] });
                        const tournament = this.roomManager.findTournamentFromPlayer(this.accountInfoService.getUsername(socket));
                        if (!tournament) return;
                        tournament.setGameWinner(currentRoom.getID(), this.accountInfoService.getUsername(socket), true);
                        this.sio.in(tournament.getID()).emit('Tournament Data Response', tournament.getGameData(), tournament.getTimePhase());
                    }
                    currentRoom.removePlayer(socket.id);
                    if (currentRoom.getRealPlayerCount(true) === 0) {
                        this.roomManager.deleteRoom(currentRoom.getID());
                    }
                    return;
                }
                currentRoom.replacePlayer(socket.id);
                if (currentRoom.getRealPlayerCount(false) === 0) {
                    const message = currentRoom.getGame.endGame();
                    this.sendGameState(currentRoom, { messageType: REPLACED_MESSAGE, values: [this.accountInfoService.getUsername(socket)] });
                    this.sendGameState(currentRoom, { messageType: END_GAME_MESSAGE, values: [message] });
                    if (currentRoom.getRealPlayerCount(true) === 0) {
                        this.roomManager.deleteRoom(currentRoom.getID());
                    }
                    socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                    return;
                }
                this.sendGameState(currentRoom, { messageType: REPLACED_MESSAGE, values: [this.accountInfoService.getUsername(socket)] });
                this.playVirtualTurns(currentRoom);
            });

            socket.on('Enter Tournament Queue', () => {
                this.tournamentQueue.push(socket);
                if (this.tournamentQueue.length < TOURNAMENT_SIZE) return;
                const users: { socket: io.Socket, username: string }[] = [];
                for (let i = 0; i < TOURNAMENT_SIZE; i++) {
                    const socketIO = this.tournamentQueue.shift();
                    if (!socketIO) continue;
                    users.push({ socket: socketIO, username: this.accountInfoService.getUsername(socketIO) });
                }
                const tid = this.roomManager.createTournament(users);
                const players = [];
                for (let user of users) {
                    user.socket.join(tid);
                    players.push(user.username);
                }
                this.sio.in(tid).emit('Tournament Found');
                this.roomManager.startTournament(tid, this.createTournamentRound.bind(this), this.startTournamentRound.bind(this), this.endTournamentRound.bind(this), this.timerMessage.bind(this));
            });

            socket.on('Get Tournament Data', () => {
                const tournament = this.roomManager.findTournamentFromPlayer(this.accountInfoService.getUsername(socket));
                if (!tournament) return;
                socket.emit('Tournament Data Response', tournament.getGameData(), tournament.getTimePhase());
            });

            socket.on('Exit Tournament', () => {
                const index = this.tournamentQueue.indexOf(socket);
                if (index >= 0) {
                    this.tournamentQueue.splice(index, 1);
                    return;
                }
            });

            socket.on('disconnect', async () => {
                console.log(new Date().toLocaleTimeString() + ' | User Disconnected from server');
                this.usersStatusService.removeOnlineUser(this.accountInfoService.getUserId(socket));
                const room = this.roomManager.findRoomFromPlayer(socket.id);
                if (!room) return;
                let isObserver;
                if (room.getVisibility() === RoomVisibility.Tournament) {
                    if (!room.getGame.isGameOver()) {
                        const message = room.getGame.endGame();
                        this.sendGameState(room, { messageType: DISCONNECT_MESSAGE, values: [this.accountInfoService.getUsername(socket)] });
                        this.sendGameState(room, { messageType: END_GAME_MESSAGE, values: [message] });
                        const tournament = this.roomManager.findTournamentFromPlayer(this.accountInfoService.getUsername(socket));
                        if (!tournament) return;
                        tournament.setGameWinner(room.getID(), this.accountInfoService.getUsername(socket), true);
                        this.sio.in(tournament.getID()).emit('Tournament Data Response', tournament.getGameData(), tournament.getTimePhase());
                    }
                    room.removePlayer(socket.id);
                    if (room.getRealPlayerCount(true) === 0) {
                        this.roomManager.deleteRoom(room.getID());
                    }
                    return;
                }
                if (room.isGameStarted()) {
                    room.replacePlayer(socket.id);
                } else {
                    isObserver = !room.removePlayer(socket.id);
                }
                socket.leave(room.getID());
                if (isObserver) return;
                if (!room.isGameStarted()) {
                    const playerNames = this.roomManager.getRoomPlayerNames(room.getID());
                    socket.to(room.getID()).emit('Room Player Update', playerNames);
                    socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                    return;
                }
                if (room.getRealPlayerCount(false) === 0) {
                    const message = room.getGame.endGame();
                    this.sendGameState(room, { messageType: REPLACED_MESSAGE, values: [this.accountInfoService.getUsername(socket)] });
                    this.sendGameState(room, { messageType: END_GAME_MESSAGE, values: [message] });
                    if (room.getRealPlayerCount(true) === 0) {
                        this.roomManager.deleteRoom(room.getID());
                    }
                    socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                    return;
                }
                this.sendGameState(room, { messageType: REPLACED_MESSAGE, values: [this.accountInfoService.getUsername(socket)] });
                this.playVirtualTurns(room);
            });
        });
    }

    private async playVirtualTurns(room: GameRoom) {
        let virtualReturnValue;
        while (virtualReturnValue = await room.getGame.attemptVirtualPlay()) {
            this.sendGameState(room, virtualReturnValue.result.playerMessage);
            if (virtualReturnValue.result.endGameMessage) this.sendGameState(room, { messageType: END_GAME_MESSAGE, values: [virtualReturnValue.result.endGameMessage] });
        }
    }

    private sendGameState(room: GameRoom, message?: PlayerMessage) {
        const gameState = room.getGame.createGameState();
        gameState.message = message;
        this.sio.in(room.getID()).emit('Game State Update', gameState);
        if (!gameState.gameOver) room.getGame.resetTimer();
    }

    private timerCallback(room: GameRoom, username: string, result: CommandResult) {
        if (room.getGame.isGameOver()) return;
        this.sendGameState(room, { messageType: OUT_OF_TIME_MESSAGE, values: [username] });
        if (result.endGameMessage) {
            this.sendGameState(room, { messageType: END_GAME_MESSAGE, values: [result.endGameMessage] });
            if (room.getVisibility() === RoomVisibility.Tournament) {
                const tournament = this.roomManager.findTournamentFromPlayer(username);
                if (!tournament) return
                tournament.setGameWinner(room.getID(), room.getGame.getWinner())
                this.sio.in(tournament.getID()).emit('Tournament Data Response', tournament.getGameData(), tournament.getTimePhase());
            }
            return;
        };
        this.playVirtualTurns(room);
    }

    private startTournamentRound(tid: string, rooms: string[]) {
        this.roomManager.getRoom(rooms[0]).startGame(this.timerCallback.bind(this));
        this.roomManager.updateTournamentGameStatus(tid, rooms[0], GameStatus.IN_PROGRESS);
        this.roomManager.getRoom(rooms[1]).startGame(this.timerCallback.bind(this));
        this.roomManager.updateTournamentGameStatus(tid, rooms[1], GameStatus.IN_PROGRESS);
        console.log(new Date().toLocaleTimeString() + ' | New tournament games started');
        this.sio.in(rooms[0]).emit('Game Started');
        this.sio.in(rooms[1]).emit('Game Started');
    }

    private createTournamentRound(tid: string, users: io.Socket[], round: number): string[] {
        const rooms = [this.roomManager.createRoom(tid + ('-' + round + '-1'), RoomVisibility.Tournament), this.roomManager.createRoom(tid + ('-' + round + '-2'), RoomVisibility.Tournament)];
        for (let i = 0; i < users.length; i++) {
            const index = i < 2 ? 0 : 1;
            users[i].join(rooms[index]);
            this.roomManager.addPlayer(rooms[index], new Player(users[i].id, this.accountInfoService.getUsername(users[i])));
        }
        if (round === 1) {
            this.roomManager.registerTournamentGames(tid, rooms[0], rooms[1]);
        } else {
            this.roomManager.updateTournamentGameRoomCode(tid, rooms);
        }
        return rooms;
    }

    private endTournamentRound(tid: string) {
        const endMessages = this.roomManager.endTournamentGames(tid);
        for (let endMessage of endMessages) {
            this.sendGameState(endMessage.room, { messageType: ROUND_OVER_MESSAGE, values: [] });
            this.sendGameState(endMessage.room, { messageType: END_GAME_MESSAGE, values: [endMessage.endMessage] });
        }
        this.sio.in(tid).emit('Tournament Data Response', this.roomManager.getTournamentGameData(tid), this.roomManager.getTournamentTimeData(tid));
    }

    private timerMessage(tid: string, timeLeft: string) {
        this.sio.in(tid).emit('Message Action History', { messageType: ROUND_TIME_LEFT_MESSAGE, values: [timeLeft] });
    }
}
