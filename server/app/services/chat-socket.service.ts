import { ChatType } from '@app/interfaces/chat-info';
import * as io from 'socket.io';
import Container, { Service } from 'typedi';
import { AccountInfoService } from './account-info.service';
import { ChatService } from './chat.service';

@Service()
export class ChatSocketService {
    private readonly chatService: ChatService;
    private readonly accountInfoService: AccountInfoService;

    constructor() {
        this.chatService = Container.get(ChatService);
        this.accountInfoService = Container.get(AccountInfoService);
    }

    handleChatSockets(socket: io.Socket) {
        socket.on('Message Sent', (message: string) => {
            socket.emit('New Message', message);
            socket.broadcast.emit('New Message', message);
            // eslint-disable-next-line no-console
            console.log(new Date().toLocaleTimeString() + ' | New Message : ' + message);
        });

        socket.on('Create New Chat', async (chatName: string, chatType: ChatType) => {
            socket.emit('Chat Creation Response', await this.chatService.createChat(this.accountInfoService.getUserId(socket), chatName, chatType));
        });

        socket.on('Public Chat List Response', async () => {
            socket.emit('Public Chat List Response', await this.chatService.getPublicChatsUserCanJoin(this.accountInfoService.getUserId(socket)));
        });

        socket.on('Join Public Chat', async (chatCode: string) => {
            socket.emit('Join Chat Response', await this.chatService.joinChat(this.accountInfoService.getUserId(socket), chatCode));
        });

        socket.on('Leave Public Chat', async (chatCode: string) => {
            socket.emit('Leave Chat Response', await this.chatService.leaveChat(this.accountInfoService.getUserId(socket), chatCode));
        });

        socket.on('Get User Chat List', async () => {
            socket.emit('User Chat List Response', await this.chatService.getUserChats(this.accountInfoService.getUserId(socket)));
        });
    }
}
