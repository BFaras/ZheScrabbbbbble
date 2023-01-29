import * as io from 'socket.io';

export class ChatSocketService {
    handleChatSockets(socket: io.Socket) {
        socket.on('Message Sent', (message: string) => {
            socket.emit('New Message', message);
            socket.broadcast.emit('New Message', message);
            console.log(message);
        });
    }
}
