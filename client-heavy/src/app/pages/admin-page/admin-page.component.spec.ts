/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { VirtualPlayerDifficulty } from '@app/classes/virtual-player-difficulty';
import { GameType } from '@app/constants/game-types';
import { AdminService } from '@app/services/admin-service/admin.service';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    const dialogMock = {
        open: () => {
            return;
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [AdminPageComponent],
            providers: [{ provide: MatDialogRef, useValue: dialogMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [AdminService],
        });
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        component.virtualPlayers = [
            { name: 'Rebecca', difficulty: VirtualPlayerDifficulty.BEGINNER, default: true },
            { name: 'Damien', difficulty: VirtualPlayerDifficulty.BEGINNER, default: false },
            { name: 'Alex', difficulty: VirtualPlayerDifficulty.BEGINNER, default: false },
        ];
        component.gameHistory = [
            {
                date: '02/04/2022',
                time: '15h32',
                length: '45min 20s',
                player1: { name: 'Suzan', score: 300, virtual: false, winner: true },
                player2: { name: 'Karen', score: 250, virtual: false, winner: false },
                mode: GameType.CLASSIQUE,
            },
            {
                date: '02/04/2022',
                time: '15h32',
                length: '45min 20s',
                player1: { name: 'Katy', score: 300, virtual: false, winner: true },
                player2: { name: 'Rebecca', score: 250, virtual: true, difficulty: VirtualPlayerDifficulty.BEGINNER, winner: false },
                mode: GameType.LOG2990,
                abandoned: false,
            },
            {
                date: '02/04/2022',
                length: '45min 20s',
                time: '15h32',
                player1: { name: 'John', score: 300, virtual: false, winner: false },
                player2: { name: 'Alex', score: 250, virtual: true, difficulty: VirtualPlayerDifficulty.EXPERT, winner: true },
                mode: GameType.CLASSIQUE,
                abandoned: true,
            },
            {
                date: '02/04/2022',
                length: '45min 20s',
                time: '15h32',
                player1: { name: 'Marty', score: 300, virtual: false, winner: true },
                player2: { name: 'Sam', score: 250, virtual: false, winner: false },
                mode: GameType.CLASSIQUE,
            },
            {
                date: '02/04/2022',
                length: '45min 20s',
                time: '15h32',
                player1: { name: 'Frank', score: 300, virtual: false, winner: true },
                player2: { name: 'Daria', score: 250, virtual: false, winner: false },
                mode: GameType.LOG2990,
            },
            {
                date: '02/04/2022',
                length: '45min 20s',
                time: '15h32',
                player1: { name: 'Tina', score: 300, virtual: false, winner: false },
                player2: { name: 'Pablo', score: 250, virtual: true, difficulty: VirtualPlayerDifficulty.BEGINNER, winner: true },
                mode: GameType.LOG2990,
                abandoned: true,
            },
        ];
        component.dictList = [
            { title: 'Mon dictionnaire', description: 'Dictionnaire français par défaut.' },
            {
                title: 'Cuisine',
                description: 'Dictionnaire contenant du vocabulaire portant sur la gastromomie, la nourriture, les ustensiles, etc.',
            },
            { title: 'École', description: 'Dictionnaire contenant les objets, personnes et actions faites dans une école.' },
            { title: 'Faune et flore', description: 'desc1' },
            { title: 'Technologie', description: 'desc2' },
            { title: 'Ferme', description: 'desc3' },
            { title: 'Géographie', description: 'desc1' },
            { title: 'Musique', description: 'desc2' },
            { title: 'English', description: 'desc3' },
        ];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' Supprimer button for dictionaries should create an alert with 2 options.', fakeAsync(() => {
        const alertSpy = spyOn(window, 'confirm').and.returnValue(true);
        const supprimerDict = fixture.debugElement.nativeElement.querySelector('#supprimer-dict');
        supprimerDict.click();
        expect(alertSpy).toHaveBeenCalledWith('Êtes-vous sûr(e) de vouloir supprimer ce dictionnaire?');
    }));

    it(' Supprimer button for virtual players should create an alert with 2 options.', () => {
        const alertSpy = spyOn(window, 'confirm').and.returnValue(true);
        const supprimerVp = fixture.debugElement.nativeElement.querySelector('#supprimer-vp');
        supprimerVp.click();
        expect(alertSpy).toHaveBeenCalledWith('Êtes-vous sûr(e) de vouloir supprimer ce joueur virtuel?');
    });

    it(' Réinitialiser button for dictionaries should create an alert with 2 options.', fakeAsync(() => {
        const string =
            'Êtes-vous sûr(e) de vouloir réinitialiser tous les dictionnaires? Tout sera perdu sauf les trois dictionnaires par défaut. Cela prendra environ 10 secondes.';
        const alertSpy = spyOn(window, 'confirm').and.returnValue(true);
        const supprimer = fixture.debugElement.nativeElement.querySelector('#reset-btn-dict');
        supprimer.click();
        expect(alertSpy).toHaveBeenCalledWith(string);
    }));

    it(' Réinitialiser button for virtual players should create an alert with 2 options.', fakeAsync(() => {
        const string = 'Êtes-vous sûr(e) de vouloir réinitialiser tous les joueurs virtuels? Tout sera perdu sauf les joueurs par défaut.';
        const alertSpy = spyOn(window, 'confirm').and.returnValue(true);
        const supprimer = fixture.debugElement.nativeElement.querySelector('#reset-btn-vp');
        supprimer.click();
        expect(alertSpy).toHaveBeenCalledWith(string);
    }));

    it(' Réinitialiser button for games should create an alert with 2 options.', fakeAsync(() => {
        const string = 'Êtes-vous sûr(e) de vouloir réinitialiser toutes les parties? Tout sera perdu sauf les valeurs par défaut.';
        const alertSpy = spyOn(window, 'confirm').and.returnValue(true);
        const supprimer = fixture.debugElement.nativeElement.querySelector('#reset-btn-games');
        supprimer.click();
        expect(alertSpy).toHaveBeenCalledWith(string);
    }));

    it(' Réinitialiser button for scores should create an alert with 2 options.', fakeAsync(() => {
        const string = 'Êtes-vous sûr(e) de vouloir réinitialiser tous les meilleurs scores? Tout sera perdu sauf les valeurs par défaut.';
        const alertSpy = spyOn(window, 'confirm').and.returnValue(true);
        const supprimer = fixture.debugElement.nativeElement.querySelector('#reset-btn-scores');
        supprimer.click();
        expect(alertSpy).toHaveBeenCalledWith(string);
    }));

    it(' Réinitialiser button for all should create an alert with 2 options.', fakeAsync(() => {
        const string =
            'Êtes-vous sûr(e) de vouloir réinitialiser toutes les données? Tout sera perdu sauf les valeurs par défaut. Cela prendra environ 10 secondes.';
        const alertSpy = spyOn(window, 'confirm').and.returnValue(true);
        const supprimer = fixture.debugElement.nativeElement.querySelector('#reset-btn-all');
        supprimer.click();
        expect(alertSpy).toHaveBeenCalledWith(string);
    }));

    it('openForm should call dialog.open', () => {
        const openSpy = spyOn(component.dialog, 'open');
        component.openForm();
        expect(openSpy).toHaveBeenCalled();
    });

    it('should call communication service post dictionary when submiting a valid dictionary file', async () => {
        const postSpy = spyOn(component['communicationService'], 'postDictionary');
        component.newFile = [
            {
                text: async () => {
                    return new Promise<string>((resolve) => {
                        resolve('{"title": "test", "description": "test", "words": ["test"]}');
                    });
                },
            } as File,
        ] as unknown as FileList;
        await component.submitFile({} as HTMLInputElement);
        expect(postSpy).toHaveBeenCalled();
    });

    it('should send error when submiting an invalid dictionary file', async () => {
        const confirmSpy = spyOn(window, 'confirm');
        component.newFile = [
            {
                text: async () => {
                    return new Promise<string>((resolve) => {
                        resolve('');
                    });
                },
            } as File,
        ] as unknown as FileList;
        await component.submitFile({} as HTMLInputElement);
        expect(confirmSpy).toHaveBeenCalled();
    });

    it('should call getDictionary when calling downloadDictionary', () => {
        const getSpy = spyOn(component['communicationService'], 'getDictionary');
        component.downloadDictionary('test');
        expect(getSpy).toHaveBeenCalledWith('test');
    });

    it('should create new html element when calling send download to browser', () => {
        const getSpy = spyOn(document, 'createElement').and.returnValue({ click: () => {} } as HTMLElement);
        component.sendDownloadToBrowser({ title: 'test', description: 'test', words: ['test'] });
        expect(getSpy).toHaveBeenCalledWith('a');
    });

    it('should get file when calling getFile', () => {
        component.getFile({ target: { files: { test: 'test' } as unknown as FileList } } as unknown as Event);
        expect(component.newFile).toEqual({ test: 'test' } as unknown as FileList);
    });
});
