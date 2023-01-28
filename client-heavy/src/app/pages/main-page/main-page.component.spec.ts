/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { GameType } from '@app/classes/game-settings';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule],
            declarations: [MainPageComponent, LeaderboardComponent],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }, { provide: MatDialog }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open a dialog when calling openScores()', () => {
        const openDialogSpy = spyOn(component['dialog'], 'open');
        component.openScores();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('should call setScrabbleMode when setScrabbleMode is called', () => {
        const gameType = GameType.CLASSIC;
        const setScrabbleModeSpy = spyOn(component['gameModeService'], 'setScrabbleMode');
        component.setScrabbleMode(gameType);
        expect(setScrabbleModeSpy).toHaveBeenCalledWith(gameType);
    });

    it('should return a typeof GameType when calling get gameTypeEnum', () => {
        expect(typeof component.gameTypeEnum === typeof GameType).toBeTrue();
    });
});
