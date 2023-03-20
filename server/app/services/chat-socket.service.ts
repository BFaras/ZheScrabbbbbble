import { NO_ERROR } from '@app/constants/error-code-constants';
import { ChatType } from '@app/interfaces/chat-info';
import { ChatMessage } from '@app/interfaces/chat-message';
import * as io from 'socket.io';
import Container, { Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { ChatService } from './chat.service';
import { TimeFormatterService } from './time-formatter.service';

@Service()
export class ChatSocketService {
    private readonly chatService: ChatService;
    private readonly accountInfoService: AccountInfoService;
    private readonly timeFormatterService: TimeFormatterService;

    constructor() {
        this.chatService = Container.get(ChatService);
        this.accountInfoService = Container.get(AccountInfoService);
        this.timeFormatterService = Container.get(TimeFormatterService);
    }

    handleChatSockets(socket: io.Socket) {
        socket.on('New Chat Message', (message: string, chatCode: string) => {
            const chatMessage: ChatMessage = {
                message,
                username: this.accountInfoService.getUsername(socket),
                timestamp: this.timeFormatterService.getTimeStampString(),
            };
            socket.emit('New Chat Message', chatCode, chatMessage);
            socket.to(chatCode).emit('New Chat Message', chatCode, chatMessage);
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
            if (errorMessage === NO_ERROR) {
                socket.join(chatCode);
            }
            socket.emit('Join Chat Response', errorMessage);
        });

        socket.on('Leave Public Chat', async (chatCode: string) => {
            const errorMessage = await this.chatService.leaveChat(this.accountInfoService.getUserId(socket), chatCode);
            if (errorMessage === NO_ERROR) {
                socket.leave(chatCode);
            }
            socket.emit('Leave Chat Response', errorMessage);
        });

        socket.on('Get User Chat List', async () => {
            socket.emit('User Chat List Response', await this.chatService.getUserChats(this.accountInfoService.getUserId(socket)));
        });
    }
}
