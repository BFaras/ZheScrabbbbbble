/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-restricted-imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterTestingModule } from '@angular/router/testing';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { CreateGameComponent } from '../create-game/create-game.component';
import { JoinGameComponent } from '../join-game/join-game.component';
import { WaitingRoomComponent } from './waiting-room.component';

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let waitingRoomManagerService: WaitingRoomManagerService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: 'join-game', component: JoinGameComponent },
                    { path: 'create-game', component: CreateGameComponent },
                    { path: 'game', component: GamePageComponent },
                ]),
                MatProgressSpinnerModule,
            ],
            declarations: [WaitingRoomComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        waitingRoomManagerService = TestBed.inject(WaitingRoomManagerService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deleteRoom should call deleteRoom from WaitingRoomManagerService', () => {
        spyOn(waitingRoomManagerService, 'deleteRoom');
        component.deleteRoom();
        expect(waitingRoomManagerService.deleteRoom).toHaveBeenCalled();
    });

    it('should update host player message if updateJoinMessage is called', () => {
        component['waitingRoomManagerService'].setGuestPlayer(true);
        component['updateJoinMessage']('Joe');
        expect(component.message).toEqual('Joe tente de rejoindre votre partie');
    });

    it('should not update guest player message if updateJoinMessage is called', () => {
        component['waitingRoomManagerService'].setGuestPlayer(false);
        component['updateJoinMessage']('Joe');
        expect(component.message).toEqual("Veuillez attendre qu'un joueur rejoigne votre salle.");
    });

    it('should navigate to game if the join response is true', () => {
        const routerSpy = spyOn(component['router'], 'navigate');
        component['manageJoinResponse'](true);
        expect(routerSpy).toHaveBeenCalledWith(['/game']);
    });

    it('should navigate to join game screen if the join response is false', () => {
        const routerSpy = spyOn(component['router'], 'navigate');
        component['manageJoinResponse'](false);
        expect(routerSpy).toHaveBeenCalledWith(['/join-game']);
    });

    it('should navigate to game when launch game is called', () => {
        const routerSpy = spyOn(component['router'], 'navigate');
        component.launchGame();
        expect(routerSpy).toHaveBeenCalledWith(['/game']);
    });

    it('should navigate to join game when leave room is called', () => {
        const routerSpy = spyOn(component['router'], 'navigate');
        component.leaveRoom();
        expect(routerSpy).toHaveBeenCalledWith(['/join-game']);
    });

    it('should reset the guest to a non-waiting on the client when denyPlayer is called', () => {
        component.isGuestPlayerWaiting = true;
        component.denyPlayer();
        expect(component.isGuestPlayerWaiting).toBeFalsy();
    });

    it('should change message value when calling update waiting status', () => {
        component.isGuestPlayerWaiting = true;
        component.message = 'test1';
        component.updateWaitingStatus('test2');
        expect(component.message).toEqual('test2');
        expect(component.isGuestPlayerWaiting).toBeFalse();
    });

    it('should navigate to create game when converting multi game to solo', () => {
        const navigateSpy = spyOn(component['router'], 'navigate');
        component.convertMultiToSolo();
        expect(navigateSpy).toHaveBeenCalledWith(['/create-game']);
    });
});
