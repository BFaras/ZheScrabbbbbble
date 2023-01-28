/* eslint-disable no-restricted-imports */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TIMER_MODIFICATION_VALUE } from '@app/classes/timer';
import { VirtualPlayerDifficulty } from '@app/classes/virtual-player-difficulty';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { of } from 'rxjs';
import { WaitingRoomComponent } from '../waiting-room/waiting-room.component';
import { CreateGameComponent } from './create-game.component';

describe('CreateGameComponent', () => {
    let component: CreateGameComponent;
    let fixture: ComponentFixture<CreateGameComponent>;
    let waitingRoomManagerService: WaitingRoomManagerService;
    let gameModeService: GameModeService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: 'waiting-room', component: WaitingRoomComponent },
                    { path: 'game', component: CreateGameComponent },
                ]),
            ],
            declarations: [CreateGameComponent],
            providers: [WaitingRoomManagerService, GameModeService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateGameComponent);
        component = fixture.componentInstance;
        component.dictionaryList = [{ title: 'DictionaryTitle', description: 'Default dictionary' }];
        fixture.detectChanges();
        waitingRoomManagerService = TestBed.inject(WaitingRoomManagerService);
        gameModeService = TestBed.inject(GameModeService);
        component.virtualPlayerNameList = [
            { name: 'Alex', difficulty: VirtualPlayerDifficulty.BEGINNER, default: true },
            { name: 'Michel', difficulty: VirtualPlayerDifficulty.BEGINNER, default: true },
            { name: 'Rebecca', difficulty: VirtualPlayerDifficulty.EXPERT, default: true },
        ];
        component.buttonDisabled = false;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('createSoloRoom should call checkVirtualPlayerName', () => {
        const checkVirtualPlayerNameSpy = spyOn(component, 'checkVirtualPlayerName');
        component.createSoloRoom('PlayerNameTest');
        expect(checkVirtualPlayerNameSpy).toHaveBeenCalled();
    });

    it('createMultiRoom should set roomToJoin to roomName', () => {
        const hostElement = fixture.nativeElement;
        const roomNameInput: HTMLInputElement = hostElement.querySelector('#room-name');
        roomNameInput.value = 'RoomNameTest';
        roomNameInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        component.createMultiRoom('PlayerNameTest');
        expect(waitingRoomManagerService.getRoomToJoin()).toEqual('RoomNameTest');
    });

    it('createMultiRoom should set hostPlayer to true', () => {
        component.dictionaryList = [{ title: 'DictionaryTitle', description: 'Default dictionary' }];
        component.createMultiRoom('PlayerNameTest');
        expect(waitingRoomManagerService.isHostPlayer()).toBeTrue();
    });

    it('createMultiRoom should set message to Veuillez attendre qu un joueur rejoigne votre salle.', () => {
        component.createMultiRoom('PlayerNameTest');
        expect(waitingRoomManagerService.getMessageSource()).toEqual("Veuillez attendre qu'un joueur rejoigne votre salle.");
    });

    it('should call an alert when wrong inputs are given on CreateGame-MultiMode', () => {
        const spyAlert = spyOn(window, 'alert');
        component.checkMultiInput('');
        const button = fixture.debugElement.query(By.css('#createGame'));
        button.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spyAlert).toHaveBeenCalled();
    });

    it('should call an alert when wrong inputs are given on CreateGame-SoloMode', () => {
        const spyAlert = spyOn(window, 'alert');
        component.checkSoloInput('');
        const button = fixture.debugElement.query(By.css('#createGame'));
        button.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spyAlert).toHaveBeenCalled();
    });

    it('should update virtual player name accoring to VirtualPlayerDifficulty value', () => {
        component.isSoloMode = true;
        gameModeService.isSoloMode = true;
        fixture.detectChanges();
        const selectedDifficulty = fixture.debugElement.query(By.css('#game-difficulty'));
        selectedDifficulty.nativeElement.value = VirtualPlayerDifficulty.EXPERT;
        selectedDifficulty.nativeElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        component.updateRandomName();
        expect(component.randomName).toEqual('Rebecca');
    });

    it('checkVirtualPlayerName should call an alert when randomName has been modified', () => {
        component.isSoloMode = true;
        gameModeService.isSoloMode = true;
        fixture.detectChanges();
        const spyAlert = spyOn(window, 'alert');
        component.randomName = 'Alex';
        component.isSoloMode = true;
        component.selectedDifficulty = VirtualPlayerDifficulty.BEGINNER;
        component.checkVirtualPlayerName('Alex');
        expect(spyAlert).toHaveBeenCalled();
    });

    it('checkVirtualPlayerName should not call an alert when randomName has not been modified', () => {
        const spyAlert = spyOn(window, 'alert');
        component.randomName = 'PlayerNameTest1';
        component.checkVirtualPlayerName('PlayerNameTest2');
        expect(spyAlert).not.toHaveBeenCalled();
    });

    it('printTimer should display the time correctly', () => {
        component.timer.minute = 1;
        component.timer.second = TIMER_MODIFICATION_VALUE;
        component.printTimer();
        expect(component.time.nativeElement.innerHTML).toBe('1:30');
    });

    it('printTimer should be called when decrement button is clicked', () => {
        const printTimerSpy = spyOn(component, 'printTimer');
        component.decrementClock();
        expect(printTimerSpy).toHaveBeenCalled();
    });

    it('printTimer should be called when increment button is clicked', () => {
        const printTimerSpy = spyOn(component, 'printTimer');
        component.incrementClock();
        expect(printTimerSpy).toHaveBeenCalled();
    });

    it('incrementClock function increases time value by 30 seconds upon each click', () => {
        component.timer.minute = 1;
        component.timer.second = 0;
        component.incrementClock();
        expect(component.timer.minute).toBe(1);
        expect(component.timer.second).toBe(TIMER_MODIFICATION_VALUE);
        expect(component.decrementButton.nativeElement.disabled).toBe(false);
    });

    it('incrementClock function increases minute value by 1 if seconds equal 60', () => {
        component.timer.minute = 1;
        component.timer.second = TIMER_MODIFICATION_VALUE;
        component.incrementClock();
        expect(component.timer.minute).toBe(2);
        expect(component.timer.second).toBe(0);
        expect(component.decrementButton.nativeElement.disabled).toBe(false);
    });

    it('incrementClock function disables increment button when minute equal 5', () => {
        component.timer.minute = 4;
        component.timer.second = TIMER_MODIFICATION_VALUE;
        component.incrementClock();
        expect(component.incrementButton.nativeElement.disabled).toBe(true);
    });

    it('decrementClock function decreases time value by 30 seconds upon each click', () => {
        component.timer.minute = 1;
        component.timer.second = TIMER_MODIFICATION_VALUE;
        component.decrementClock();
        expect(component.timer.minute).toBe(1);
        expect(component.timer.second).toBe(0);
        expect(component.incrementButton.nativeElement.disabled).toBe(false);
    });

    it('decrementClock function decreases minute value by 1 if seconds decreases past 0', () => {
        component.timer.minute = 1;
        component.timer.second = 0;
        component.decrementClock();
        expect(component.timer.minute).toBe(0);
        expect(component.timer.second).toBe(TIMER_MODIFICATION_VALUE);
        expect(component.incrementButton.nativeElement.disabled).toBe(false);
    });

    it('decrementClock function disables decrement button when minute equal 0 and seconds equal to 30', () => {
        component.timer.minute = 1;
        component.timer.second = 0;
        component.decrementClock();
        expect(component.decrementButton.nativeElement.disabled).toBe(true);
    });

    it('should update html when calling update settings', () => {
        component.time = { nativeElement: { innerHTML: 'test' } };
        component.updateSettings({ playerName: 'testName', timer: { minute: 4, second: 30 } });
        expect(component.time.nativeElement.innerHTML).not.toEqual('test');
    });

    it('should call updateRandomName if isSoloMode is true', () => {
        const updateRandomNameSpy = spyOn(component, 'updateRandomName');
        component.isSoloMode = true;
        component.updateVirtualPlayerNameList(component.virtualPlayerNameList);
        expect(updateRandomNameSpy).toHaveBeenCalled();
    });

    it('should update dictionaryList when updateDictionary is called', () => {
        const dictionaryList = [
            { title: 'Dictionary1', description: 'Dictionary1' },
            { title: 'Dictionary2', description: 'Dictionary2' },
        ];
        component.updateDictionaries(dictionaryList);
        expect(component.dictionaryList).toEqual(dictionaryList);
    });

    it('should unsubscribe when destroyed', () => {
        component.subscriptionSettings = of(true).subscribe();
        component.subscriptionDictionary = of(true).subscribe();
        component.subscriptionNamesList = of(true).subscribe();
        component.ngOnDestroy();
        expect(component.subscriptionSettings.closed).toBeTruthy();
        expect(component.subscriptionDictionary.closed).toBeTruthy();
        expect(component.subscriptionNamesList.closed).toBeTruthy();
    });
});
