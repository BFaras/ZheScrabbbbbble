import { INVALID_DATA_SENT, NO_ERROR } from '@app/constants/error-code-constants';
import { ChatCreationResponse, ChatInfo, ChatType } from '@app/interfaces/chat-info';
import { ChatMessage } from '@app/interfaces/chat-message';
import * as io from 'socket.io';
import Container, { Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { AuthSocketService } from './auth-socket.service';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';
import { TimeFormatterService } from './time-formatter.service';

@Service()
export class ChatSocketService {
    private readonly chatService: ChatService;
    private readonly accountInfoService: AccountInfoService;
    private readonly timeFormatterService: TimeFormatterService;
    private readonly dbService: DatabaseService;
    private readonly authSocketService: AuthSocketService;

    constructor() {
        this.chatService = Container.get(ChatService);
        this.accountInfoService = Container.get(AccountInfoService);
        this.timeFormatterService = Container.get(TimeFormatterService);
        this.dbService = Container.get(DatabaseService);
        this.authSocketService = Container.get(AuthSocketService);
    }

    handleChatSockets(socket: io.Socket) {
        socket.on('New Chat Message', async (message: string, chatCode: string) => {
            const userId: string = this.accountInfoService.getUserId(socket);
            if (message && chatCode && userId) {
                const chatMessage: ChatMessage = {
                    message,
                    username: this.accountInfoService.getUsername(socket),
                    avatar: await this.dbService.getUserAvatar(userId),
                    timestamp: this.timeFormatterService.getTimeStampString(),
                };
                await this.chatService.addChatMessageToHistory(userId, chatCode, chatMessage);

                socket.emit('New Chat Message', chatCode, chatMessage);

                if (this.chatService.isGameChat(chatCode)) {
                    socket.to(chatCode).emit('New Chat Message', chatCode, chatMessage);
                } else {
                    socket.to(this.chatService.getChatRoomName(chatCode)).emit('New Chat Message', chatCode, chatMessage);
                }

                // eslint-disable-next-line no-console
                new Date().toLocaleTimeString() + ' | New Message : ' + message;
            }
        });

        socket.on('Create New Chat', async (chatName: string, chatType: ChatType) => {
            if (chatName && chatType) {
                const chatCreationResponse: ChatCreationResponse = await this.chatService.createChat(
                    this.accountInfoService.getUserId(socket),
                    chatName,
                    chatType,
                );
                if (chatCreationResponse.errorCode === NO_ERROR) {
                    socket.join(chatCreationResponse.chatId);
                }
                socket.emit('Chat Creation Response', chatCreationResponse);
            } else {
                const chatCreationResponse: ChatCreationResponse = { chatId: '', errorCode: INVALID_DATA_SENT };
                socket.emit('Chat Creation Response', chatCreationResponse);
            }
        });

        socket.on('Get Public Chat List', async () => {
            const userId = this.accountInfoService.getUserId(socket);
            if (userId) {
                socket.emit('Public Chat List Response', await this.chatService.getPublicChatsUserCanJoin(userId));
            } else {
                const emptyChats: ChatInfo[] = [];
                socket.emit('Public Chat List Response', emptyChats);
            }
        });

        socket.on('Join Public Chat', async (chatCode: string) => {
            const userId = this.accountInfoService.getUserId(socket);
            if (chatCode && userId) {
                const errorMessage = await this.chatService.joinChat(userId, chatCode);
                socket.emit('Join Chat Response', errorMessage);
            } else {
                socket.emit('Join Chat Response', INVALID_DATA_SENT);
            }
        });

        socket.on('Leave Public Chat', async (chatCode: string) => {
            const userId = this.accountInfoService.getUserId(socket);
            if (chatCode && userId) {
                const errorMessage = await this.chatService.leaveChat(userId, chatCode);
                socket.emit('Leave Chat Response', errorMessage);
            } else {
                socket.emit('Leave Chat Response', INVALID_DATA_SENT);
            }
        });

        socket.on('Get User Chat List', async () => {
            const userId = this.accountInfoService.getUserId(socket);
            if (userId) {
                socket.emit('User Chat List Response', await this.chatService.getUserChats(userId));
            } else {
                const emptyChats: ChatInfo[] = [];
                socket.emit('User Chat List Response', emptyChats);
            }
        });

        socket.on('Get Chat History', async (chatId: string) => {
            if (chatId) {
                socket.emit('Chat History Response', await this.chatService.getChatHistory(chatId));
            } else {
                const emptyChatHistory: ChatMessage[] = [];
                socket.emit('Chat History Response', emptyChatHistory);
            }
        });

        socket.on('Link Socket Username', async (username: string) => {
            this.authSocketService.setupUser(socket, username, true);
        });

        socket.on('Link Socket Room', (room: string) => {
            socket.data.linkedRoom = room;
            socket.join(room);
        });

        socket.on('Unlink Socket Room', () => {
            if (!socket.data.linkedRoom) return;
            socket.leave(socket.data.linkedRoom);
            socket.data.linkedRoom = undefined;
        });
    }
}
