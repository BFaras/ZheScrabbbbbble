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
    }
}
