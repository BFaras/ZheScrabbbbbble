/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */

export class ServerSocketTestHelper {
    id: string;
    rooms: Set<string>;
    data: ServerSocketTestHelper;
    username: string;
    amountOfClues: number;
    broadcast: ServerSocketTestHelper;

    constructor(id: string) {
        this.id = id;
        this.rooms = new Set<string>();
        this.rooms.add(this.id);
        this.data = this;
        this.broadcast = this;
    }

    join(roomName: string) {
        this.rooms.add(roomName);
    }

    leave(roomName: string) {
        this.rooms.delete(roomName);
    }

    to(gameRoom: string): ServerSocketTestHelper {
        return this;
    }

    emit(eventName: string, listener: any) {}
}
