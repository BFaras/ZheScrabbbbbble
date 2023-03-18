import { Player } from '@app/classes/player';
import { VirtualPlayerEasy } from '@app/classes/virtual-player-easy';
import { MAX_NUMBER_OF_PLAYERS, RoomVisibility } from '@app/constants/basic-constants';
import { JOIN_REQUEST_REFUSED, NO_ERROR, ROOM_IS_FULL, ROOM_NAME_TAKEN, ROOM_PASSWORD_INCORRECT } from '@app/constants/error-code-constants';
import { CommandController } from '@app/controllers/command.controller';
import * as http from 'http';
import * as io from 'socket.io';
import Container from 'typedi';
import { AccountInfoService } from './account-info.service';
import { AuthSocketService } from './auth-socket.service';
import { ChatSocketService } from './chat-socket.service';
import { OnlineUsersService } from './online-users.service';
import { ProfileSocketService } from './profile-socket.service';
import { RoomManagerService } from './room-manager.service';
import { SocketDatabaseService } from './socket-database.service';

export const VIRTUAL_PLAYER_NAMES = ['Michel Gagnon', 'Eve', 'John', 'Diane', 'Alex', 'Mike', 'Emma'];

export class SocketManager {
    private sio: io.Server;
    private roomManager: RoomManagerService;
    private commandController: CommandController;
    private socketDatabaseService: SocketDatabaseService;
    private chatSocketService: ChatSocketService;
    private authSocketService: AuthSocketService;
    private onlineUsersService: OnlineUsersService;
    private accountInfoService: AccountInfoService;
    private profileSocketService: ProfileSocketService;
    private pendingJoinGameRequests: Map<string, [string, io.Socket]>;
    // private timeoutRoom: { [key: string]: NodeJS.Timeout };

    constructor(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.socketDatabaseService = new SocketDatabaseService();
        this.chatSocketService = new ChatSocketService();
        this.authSocketService = new AuthSocketService();
        this.accountInfoService = Container.get(AccountInfoService);
        this.onlineUsersService = Container.get(OnlineUsersService);
        this.roomManager = Container.get(RoomManagerService);
        this.profileSocketService = Container.get(ProfileSocketService);
        this.pendingJoinGameRequests = new Map<string, [string, io.Socket]>();
        this.commandController = new CommandController(this.roomManager);
    }

    handleSockets(): void {
        this.sio.on('connection', (socket: io.Socket) => {
            console.log(new Date().toLocaleTimeString() + ' | New device connection to server');
            this.socketDatabaseService.databaseSocketRequests(socket);
            this.chatSocketService.handleChatSockets(socket);
            this.authSocketService.handleAuthSockets(socket);
            this.profileSocketService.handleProfileSockets(socket);

            socket.on('Create Game Room', async (name: string, visibility: RoomVisibility, password?: string) => {
                console.log(new Date().toLocaleTimeString() + ' | Room creation request received');
                if (this.roomManager.verifyIfRoomExists(name)) {
                    console.log(new Date().toLocaleTimeString() + ' | Error in room creation, name taken');
                    socket.emit('Room Creation Response', ROOM_NAME_TAKEN);
                    return;
                }
                const roomId = this.roomManager.createRoom(name, visibility, password);
                const newUser = new Player(socket.id, this.accountInfoService.getUsername(socket));
                this.roomManager.addPlayer(roomId, newUser, password);
                socket.join(roomId);
                console.log(new Date().toLocaleTimeString() + ' | New ' + visibility + ' room created');
                socket.emit('Room Creation Response', NO_ERROR);
                socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
            });

            socket.on('Get Game Room List', () => {
                socket.emit('Game Room List Response', this.roomManager.getGameRooms());
            });

            socket.on('Join Game Room', (roomCode: string, password?: string) => {
                console.log(new Date().toLocaleTimeString() + ' | Room join request received');
                const username = this.accountInfoService.getUsername(socket);
                if (this.roomManager.isRoomFull(roomCode)) {
                    console.log(new Date().toLocaleTimeString() + ' | Room is full');
                    socket.emit('Join Room Response', ROOM_IS_FULL);
                    return;
                }
                /** PRIVATE*/
                if (this.roomManager.getRoomVisibility(roomCode) === RoomVisibility.Private) {
                    this.pendingJoinGameRequests.set(username, [roomCode, socket]);
                    console.log(new Date().toLocaleTimeString() + ' | Room is private. Request sent to host');
                    this.sio.to(this.roomManager.getRoomHost(roomCode).getUUID()).emit('Join Room Request', username);
                    return;
                }
                /** PROTECTED */
                if (!this.roomManager.addPlayer(roomCode, new Player(socket.id, username), password)) {
                    console.log(new Date().toLocaleTimeString() + ' | Room is protected. Incorrect room password');
                    socket.emit('Join Room Response', ROOM_PASSWORD_INCORRECT);
                    return;
                }
                /** PUBLIQUE */
                socket.join(roomCode);
                const playerNames = this.roomManager.getRoomPlayerNames(roomCode);
                console.log(new Date().toLocaleTimeString() + ' | Room joined successfully');
                socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                socket.to(roomCode).emit('Room Player Update', playerNames);
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
                this.roomManager.addPlayer(requestInfo[0], new Player(requestInfo[1].id, username));
                requestInfo[1].join(requestInfo[0]);
                const playerNames = this.roomManager.getRoomPlayerNames(requestInfo[0]);
                console.log(new Date().toLocaleTimeString() + ' | Join request accepted');
                socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                requestInfo[1].to(requestInfo[0]).emit('Room Player Update', playerNames);
                requestInfo[1].emit('Join Room Response', NO_ERROR, playerNames);
            });

            socket.on('Cancel Join Request', () => {
                this.pendingJoinGameRequests.delete(this.accountInfoService.getUsername(socket));
            });

            socket.on('Leave Game Room', () => {
                const room = this.roomManager.findRoomFromPlayer(socket.id);
                if (!room) return;
                room.removePlayer(socket.id);
                socket.leave(room.getID());
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
                if(playerCount < 2) return;
                if (currentRoom.isGameStarted()) return;
                for(let i = 0; i < MAX_NUMBER_OF_PLAYERS - playerCount; i++){
                    let name; 
                    do{
                        name = VIRTUAL_PLAYER_NAMES[Math.floor(Math.random() * VIRTUAL_PLAYER_NAMES.length)];
                    }while(currentRoom.getPlayerNames().includes(name) || currentRoom.getPlayerNames().includes(name + ' (V)'))
                    currentRoom.addPlayer(new VirtualPlayerEasy(name + ' (V)', currentRoom));
                }
                currentRoom.startGame();
                console.log(new Date().toLocaleTimeString() + ' | New game started');
                socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                socket.to(currentRoom.getID()).emit('Game Started');
                socket.emit('Game Started');
                let gameState;
                let virtualReturnValue;
                while(virtualReturnValue = await currentRoom.getGame.attemptVirtualPlay()){
                    gameState = currentRoom.getGame.createGameState();
                    gameState.message = virtualReturnValue.result.playerMessage;
                    socket.emit('Game State Update', gameState);
                    socket.to(currentRoom.getID()).emit('Game State Update', gameState);
                }
            });

            socket.on('Request Game State', () => {
                console.log(new Date().toLocaleTimeString() + ' | Game state requested');
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                console.log(new Date().toLocaleTimeString() + ' | Game state sent');
                socket.emit('Game State Update', currentRoom.getGame.createGameState());
            });

            socket.on('Play Turn', async(command: string, argument: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom || currentRoom.getGame.isGameOver()) return;
                let returnValue = this.commandController.executeCommand({ commandType: command, args: argument, playerID: socket.id });
                let gameState = currentRoom.getGame.createGameState();
                gameState.message = returnValue.playerMessage;
                socket.emit('Game State Update', gameState);
                socket.to(currentRoom.getID()).emit('Game State Update', gameState);        
                let virtualReturnValue;
                while(virtualReturnValue = await currentRoom.getGame.attemptVirtualPlay()){
                    gameState = currentRoom.getGame.createGameState();
                    gameState.message = virtualReturnValue.result.playerMessage;
                    socket.emit('Game State Update', gameState);
                    socket.to(currentRoom.getID()).emit('Game State Update', gameState);
                }
            });

            socket.on('Abandon', async () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                socket.leave(currentRoom.getID());
                currentRoom.replacePlayer(socket.id);
                if (currentRoom.getRealPlayerCount() === 0) {
                    this.roomManager.deleteRoom(currentRoom.getID());
                    socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                    return;
                }
                let gameState = currentRoom.getGame.createGameState();
                gameState.message
                socket.emit('Game State Update', gameState);
                socket.to(currentRoom.getID()).emit('Game State Update', gameState);
                while(await currentRoom.getGame.attemptVirtualPlay()){
                    gameState = currentRoom.getGame.createGameState();
                    socket.emit('Game State Update', gameState);
                    socket.to(currentRoom.getID()).emit('Game State Update', gameState);
                }
            });

            socket.on('disconnect', async () => {
                console.log(new Date().toLocaleTimeString() + ' | User Disconnected from server');
                this.onlineUsersService.removeOnlineUser(this.accountInfoService.getUsername(socket));
                const room = this.roomManager.findRoomFromPlayer(socket.id);
                if (!room) return;
                if(room.isGameStarted()){
                    room.replacePlayer(socket.id);
                }else{
                    room.removePlayer(socket.id);
                }
                socket.leave(room.getID());
                if (room.getRealPlayerCount() === 0) {
                    this.roomManager.deleteRoom(room.getID());
                    socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                    return;
                }
                if(!room.isGameStarted()){
                    const playerNames = this.roomManager.getRoomPlayerNames(room.getID());
                    socket.to(room.getID()).emit('Room Player Update', playerNames);
                    socket.broadcast.emit('Game Room List Response', this.roomManager.getGameRooms());
                    return;
                }
                let gameState = room.getGame.createGameState();
                gameState.message
                socket.emit('Game State Update', gameState);
                socket.to(room.getID()).emit('Game State Update', gameState);
                while(await room.getGame.attemptVirtualPlay()){
                    gameState = room.getGame.createGameState();
                    socket.emit('Game State Update', gameState);
                    socket.to(room.getID()).emit('Game State Update', gameState);
                }
            });
            /*
            socket.on('reconnect', (id: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(id);
                if (!currentRoom) return;
                currentRoom.getPlayer(id)?.setUUID(socket.id);
                if (!currentRoom.getIsSoloGame() && currentRoom.isPlayerTurn(socket.id)) currentRoom.getGame.swapActivePlayer();
                const roomName = currentRoom.getName();
                clearTimeout(this.timeoutRoom[roomName]);
                delete this.timeoutRoom[roomName];
                socket.join(roomName);
                this.sendGameState(currentRoom, socket);
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
            */
        });
    }

    /*
    handleError(errorType: ErrorType) {
        switch (errorType) {
            case ErrorType.IllegalCommand:
                return ILLEGAL_COMMAND_ERROR;
            case ErrorType.InvalidSyntax:
                return INVALID_SYNTAX_ERROR;
        }
    }
    */
}
