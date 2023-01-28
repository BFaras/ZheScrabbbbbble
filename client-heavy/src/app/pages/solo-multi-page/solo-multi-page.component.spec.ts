/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoloMultiPageComponent } from './solo-multi-page.component';

describe('SoloMultiPageComponent', () => {
    let component: SoloMultiPageComponent;
    let fixture: ComponentFixture<SoloMultiPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SoloMultiPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SoloMultiPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call setGameMode when setSoloMode is called', () => {
        const setGameModeSpy = spyOn(component['gameModeService'], 'setGameMode');
        component.setSoloMode(true);
        expect(setGameModeSpy).toHaveBeenCalledWith(true);
    });
});
