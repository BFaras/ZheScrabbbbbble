import * as io from 'socket.io';

export class ChatSocketService {
    handleChatSockets(socket: io.Socket) {
        socket.on('Message Sent', (message: string) => {
            socket.emit('New Message', message);
            socket.broadcast.emit('New Message', message);
            // eslint-disable-next-line no-console
            console.log(message);
        });
    }
}
