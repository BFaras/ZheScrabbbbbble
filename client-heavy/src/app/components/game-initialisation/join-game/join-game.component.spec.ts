/* eslint-disable import/namespace */
/* eslint-disable import/no-deprecated */
/* eslint-disable dot-notation */
/* eslint-disable no-restricted-imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameType } from '@app/classes/game-settings';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { JoinGameSetupComponent } from '../join-game-setup/join-game-setup.component';
import { JoinGameComponent } from './join-game.component';

describe('JoinGameComponent', () => {
    let component: JoinGameComponent;
    let fixture: ComponentFixture<JoinGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'join-game-setup', component: JoinGameSetupComponent }])],
            declarations: [JoinGameComponent],
            providers: [WaitingRoomManagerService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to join game setup when send room data is called', () => {
        const routerSpy = spyOn(component['router'], 'navigate');
        component.sendRoomData({ hostName: 'test', roomName: 'test', timer: { minute: 1, second: 0 }, gameType: GameType.CLASSIC });
        expect(routerSpy).toHaveBeenCalledWith(['/join-game-setup']);
    });

    it('placeRandomly should call sendRoomData', () => {
        component['waitingRooms'] = [
            { hostName: 'Joe', roomName: 'test1', timer: { minute: 1, second: 0 }, gameType: GameType.CLASSIC },
            { hostName: 'Eve', roomName: 'test2', timer: { minute: 1, second: 0 }, gameType: GameType.CLASSIC },
        ];
        component.sendRoomData = jasmine.createSpy();
        component.placeRandomly();
        expect(component.sendRoomData).toHaveBeenCalled();
    });

    it('should filter waitingRooms when filterRooms is called', () => {
        const rooms = [
            { hostName: 'Joe', roomName: 'test1', timer: { minute: 1, second: 0 }, gameType: GameType.CLASSIC },
            { hostName: 'Eve', roomName: 'test2', timer: { minute: 1, second: 0 }, gameType: GameType.LOG2990 },
        ];
        const classicRooms = [{ hostName: 'Joe', roomName: 'test1', timer: { minute: 1, second: 0 }, gameType: GameType.CLASSIC }];
        component.gameType = GameType.CLASSIC;
        component.filterRooms(rooms);
        expect(component.waitingRooms).toEqual(classicRooms);
    });
});
