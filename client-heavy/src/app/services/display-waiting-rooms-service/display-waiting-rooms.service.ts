import { Injectable } from '@angular/core';
import { WaitingRoom } from '@app/classes/waiting-room';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DisplayWaitingRoomsService {
    waitingRoomObservable: Subject<WaitingRoom[]> = new Subject<WaitingRoom[]>();
    waitingRooms: WaitingRoom[] = [];

    addRoom(rooms: WaitingRoom[]): void {
        this.waitingRooms = rooms;
        this.waitingRoomObservable.next(this.waitingRooms);
    }
}
