/* eslint-disable no-restricted-imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { WaitingRoomComponent } from '../waiting-room/waiting-room.component';
import { JoinGameSetupComponent } from './join-game-setup.component';

describe('JoinGameSetupComponent', () => {
    let component: JoinGameSetupComponent;
    let fixture: ComponentFixture<JoinGameSetupComponent>;
    let waitingRoomManagerService: WaitingRoomManagerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'waiting-room', component: WaitingRoomComponent }])],
            declarations: [JoinGameSetupComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinGameSetupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        waitingRoomManagerService = TestBed.inject(WaitingRoomManagerService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('displayRoomInformation should set roomToJoin to RoomNameTest', () => {
        component.displayRoomInformation('RoomNameTest');
        expect(waitingRoomManagerService.getRoomToJoin()).toEqual('RoomNameTest');
    });

    it("joinRoom should set message to Veuillez attendre que l'hôte initialise la partie.", () => {
        component.joinRoom('PlayerNameTest');
        expect(waitingRoomManagerService.getMessageSource()).toEqual("Veuillez attendre que l'hôte initialise la partie.");
    });

    it('joinRoom should call joinRoom from SocketManagerService if names are not equal', () => {
        spyOn(waitingRoomManagerService, 'joinRoom');
        const guestPlayerName = 'PlayerNameTest1';
        waitingRoomManagerService.setHostPlayerName('PlayerNameTest2');
        component.joinRoom(guestPlayerName);
        expect(waitingRoomManagerService.joinRoom).toHaveBeenCalled();
    });

    it('joinRoom should not call joinRoom from SocketManagerService if both names are equal', () => {
        spyOn(waitingRoomManagerService, 'joinRoom');
        const guestPlayerName = 'PlayerNameTest1';
        waitingRoomManagerService.setHostPlayerName('PlayerNameTest1');
        component.joinRoom(guestPlayerName);
        expect(waitingRoomManagerService.joinRoom).not.toHaveBeenCalled();
    });
});
