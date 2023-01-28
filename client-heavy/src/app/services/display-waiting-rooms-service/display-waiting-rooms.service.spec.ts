import { TestBed } from '@angular/core/testing';
import { GameType } from '@app/classes/game-settings';
import { WaitingRoom } from '@app/classes/waiting-room';
import { DisplayWaitingRoomsService } from './display-waiting-rooms.service';

describe('DisplayAvailableGamesService', () => {
    let service: DisplayWaitingRoomsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DisplayWaitingRoomsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addRoom should add a room into waitingRooms', () => {
        const room: WaitingRoom = {
            hostName: 'PlayerNameTest',
            roomName: 'RoomNameTest',
            timer: { minute: 1, second: 0 },
            gameType: GameType.CLASSIC,
        };
        const waitingRooms: WaitingRoom[] = [];
        waitingRooms.push(room);
        service.addRoom(waitingRooms);
        expect(service.waitingRooms).toEqual(waitingRooms);
    });
});
