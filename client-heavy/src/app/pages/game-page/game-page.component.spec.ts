/* eslint-disable dot-notation */
/* eslint-disable no-restricted-imports */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatComponent } from '@app/components/chat/chat.component';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { LetterHolderComponent } from '@app/components/letter-holder/letter-holder.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { MainPageComponent } from '../main-page/main-page.component';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let letterAdderService: LetterAdderService;

    beforeEach(async () => {
        const letterAdderServiceSpy = jasmine.createSpyObj('LetterAdderService', ['resetLetters', 'removeAll', 'resetMappedBoard']);
        await TestBed.configureTestingModule({
            imports: [FormsModule, RouterTestingModule.withRoutes([{ path: 'home', component: MainPageComponent }])],
            declarations: [GamePageComponent, InfoPanelComponent, PlayAreaComponent, ChatComponent, TimerComponent, LetterHolderComponent],
            providers: [LetterAdderService, { provide: LetterAdderService, useValue: letterAdderServiceSpy }],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(GamePageComponent);
                component = fixture.componentInstance;
                letterAdderService = TestBed.inject(LetterAdderService);
                letterAdderService.resetLetters();
                fixture.detectChanges();
            });
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it(' Abandonner button should create an alert with 2 options. Ok should redirect to home', fakeAsync(() => {
        const alertSpy = spyOn(window, 'confirm').and.returnValue(true);
        const routerSpy = spyOn(component['router'], 'navigate');
        const abandonner = fixture.debugElement.nativeElement.querySelector('#abandonner');
        abandonner.click();
        expect(alertSpy).toHaveBeenCalledWith('Êtes-vous sûr(e) de vouloir quitter la partie? Tout votre progrès sera perdu.');
        expect(routerSpy).toHaveBeenCalledWith(['/home']);
    }));

    it(' buttons increase and decrease should respectively call onIncrease and onDecrease when clicked', fakeAsync(() => {
        const increaseSpy = spyOn(component, 'onIncrease').and.callThrough();
        const decreaseSpy = spyOn(component, 'onDecrease').and.callThrough();

        const increase = fixture.debugElement.nativeElement.querySelector('#increase');
        const decrease = fixture.debugElement.nativeElement.querySelector('#decrease');
        increase.click();
        decrease.click();
        tick();
        expect(increaseSpy).toHaveBeenCalled();
        expect(decreaseSpy).toHaveBeenCalled();
    }));

    it('should navigate to home when calling goHome', () => {
        const navigateSpy = spyOn(component['router'], 'navigate');
        component.goHome();
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should change the value of receiver when calling setReceiver', () => {
        component.isReceiver = 'test1';
        component.setReceiver('test2');
        expect(component.isReceiver).toEqual('test2');
    });
});
