import { NO_ERROR } from '@app/constants/error-code-constants';
import { ChatType } from '@app/interfaces/chat-info';
import { ChatMessage } from '@app/interfaces/chat-message';
import * as io from 'socket.io';
import Container, { Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';
import { TimeFormatterService } from './time-formatter.service';

@Service()
export class ChatSocketService {
    private readonly chatService: ChatService;
    private readonly accountInfoService: AccountInfoService;
    private readonly timeFormatterService: TimeFormatterService;
    private readonly dbService: DatabaseService;

    constructor() {
        this.chatService = Container.get(ChatService);
        this.accountInfoService = Container.get(AccountInfoService);
        this.timeFormatterService = Container.get(TimeFormatterService);
        this.dbService = Container.get(DatabaseService);
    }

    handleChatSockets(socket: io.Socket) {
        socket.on('New Chat Message', async (message: string, chatCode: string) => {
            const userId: string = this.accountInfoService.getUserId(socket);
            const chatMessage: ChatMessage = {
                message,
                username: this.accountInfoService.getUsername(socket),
                avatar: await this.dbService.getUserAvatar(userId),
                timestamp: this.timeFormatterService.getTimeStampString(),
            };
            await this.chatService.addChatMessageToHistory(userId, chatCode, chatMessage);

            socket.emit('New Chat Message', chatCode, chatMessage);
            socket.to(this.chatService.getChatRoomName(chatCode)).emit('New Chat Message', chatCode, chatMessage);
            // eslint-disable-next-line no-console
            console.log(new Date().toLocaleTimeString() + ' | New Message : ' + message);
        });

        socket.on('Create New Chat', async (chatName: string, chatType: ChatType) => {
            const chatCreationResponse = await this.chatService.createChat(this.accountInfoService.getUserId(socket), chatName, chatType);
            if (chatCreationResponse.errorCode === NO_ERROR) {
                socket.join(chatCreationResponse.chatId);
            }
            socket.emit('Chat Creation Response', chatCreationResponse);
        });

        socket.on('Get Public Chat List', async () => {
            socket.emit('Public Chat List Response', await this.chatService.getPublicChatsUserCanJoin(this.accountInfoService.getUserId(socket)));
        });

        socket.on('Join Public Chat', async (chatCode: string) => {
            const errorMessage = await this.chatService.joinChat(this.accountInfoService.getUserId(socket), chatCode);
            socket.emit('Join Chat Response', errorMessage);
        });

        socket.on('Leave Public Chat', async (chatCode: string) => {
            const errorMessage = await this.chatService.leaveChat(this.accountInfoService.getUserId(socket), chatCode);
            socket.emit('Leave Chat Response', errorMessage);
        });

        socket.on('Get User Chat List', async () => {
            socket.emit('User Chat List Response', await this.chatService.getUserChats(this.accountInfoService.getUserId(socket)));
        });

        socket.on('Get Chat History', async (chatId: string) => {
            socket.emit('Chat History Response', await this.chatService.getChatHistory(chatId));
        });
    }
}
