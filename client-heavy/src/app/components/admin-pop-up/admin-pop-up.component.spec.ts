import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { VirtualPlayerDifficulty } from '@app/classes/virtual-player-difficulty';
import { AdminService } from '@app/services/admin-service/admin.service';
import { AdminPopUpComponent } from './admin-pop-up.component';

describe('AdminPopUpComponent', () => {
    let component: AdminPopUpComponent;
    let fixture: ComponentFixture<AdminPopUpComponent>;
    let adminServiceSpy: jasmine.SpyObj<AdminService>;

    const dialogMock = {
        close: () => {
            return;
        },
    };

    beforeEach(async () => {
        adminServiceSpy = jasmine.createSpyObj('AdminService', ['addVirtualPlayer', 'editDictionary', 'editVirtualPlayer']);
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, ReactiveFormsModule, FormsModule],
            declarations: [AdminPopUpComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: AdminService, useValue: adminServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPopUpComponent);
        component = fixture.componentInstance;
        component.newName = '';
        component.newDifficulty = '';
        component.originalValues = {
            dict: {
                title: '',
                description: '',
            },
            virtualPlayer: {
                vpName: '',
                vpDifficulty: VirtualPlayerDifficulty.BEGINNER,
            },
            formType: 'virtualPlayer',
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('submitInput should call addVirtualPlayer if the formType is virtualPlayer and if there is no original name.', () => {
        const submitSpy = spyOn(component, 'onNoClick');
        const addPlayerSpy = spyOn(component, 'addVirtualPlayer');
        component.submitInput();
        expect(submitSpy).toHaveBeenCalled();
        expect(addPlayerSpy).toHaveBeenCalled();
    });

    it('submitInput should call modifyVirtualPlayer if the formType is virtualPlayer and if there is an original name.', () => {
        const submitSpy = spyOn(component, 'onNoClick');
        const modifyPlayerSpy = spyOn(component, 'modifyVirtualPlayer');
        component.originalValues.virtualPlayer.vpName = 'John';
        component.submitInput();
        expect(submitSpy).toHaveBeenCalled();
        expect(modifyPlayerSpy).toHaveBeenCalled();
    });

    it('submitInput should reset the original name if the formType is virtualPlayer and if there is an original name.', () => {
        const submitSpy = spyOn(component, 'onNoClick');
        component.originalValues.virtualPlayer.vpName = 'John';
        component.submitInput();
        expect(submitSpy).toHaveBeenCalled();
        expect(component.originalValues.virtualPlayer.vpName).toEqual('');
    });

    it('submitInput should call modifyDict if the formType is dictonary', () => {
        const submitSpy = spyOn(component, 'onNoClick');
        const modifyDictSpy = spyOn(component, 'modifyDict');
        component.originalValues.formType = 'dictionary';
        component.submitInput();
        expect(submitSpy).toHaveBeenCalled();
        expect(modifyDictSpy).toHaveBeenCalled();
    });

    it('addVirtualPlayer should create an alert if one or both of the inputs are left blank.', () => {
        const alertSpy = spyOn(window, 'alert');
        component.addVirtualPlayer();
        expect(alertSpy).toHaveBeenCalledWith('Veuillez remplir tous les champs.');
        component.newName = 'hey';
        component.addVirtualPlayer();
        expect(alertSpy).toHaveBeenCalledWith('Veuillez remplir tous les champs.');
        component.newName = '';
        component.newDifficulty = 'hey';
        expect(alertSpy).toHaveBeenCalledWith('Veuillez remplir tous les champs.');
    });

    it("addVirtualPlayer should call addVirtualPlayer from adminService with the new virtual player's name and difficulty.", () => {
        component.newName = 'Sam';
        component.newDifficulty = 'débutant';
        component.addVirtualPlayer();
        expect(adminServiceSpy.addVirtualPlayer).toHaveBeenCalledWith('Sam', 'débutant');
    });

    it('onNoClick should call dialogRef.close', () => {
        const closeSpy = spyOn(component.dialogRef, 'close');
        component.onNoClick();
        expect(closeSpy).toHaveBeenCalled();
    });

    it("modifyDict should keep the original name if the user didn't enter any name.", () => {
        component.originalValues.dict = { title: 'Mon dictionnaire', description: 'bloop' };
        component.newDescription = 'moop';
        component.modifyDict();
        expect(adminServiceSpy.editDictionary).toHaveBeenCalledWith('Mon dictionnaire', 'Mon dictionnaire', 'moop');
    });

    it("modifyDict should keep the original description if the user didn't enter any.", () => {
        component.originalValues.dict = { title: 'Mon dictionnaire', description: 'bloop' };
        component.newName = 'moop';
        component.modifyDict();
        expect(adminServiceSpy.editDictionary).toHaveBeenCalledWith('Mon dictionnaire', 'moop', 'bloop');
    });

    it('modifyDict should update the name and the description if the user changes them.', () => {
        component.originalValues.dict = { title: 'Mon dictionnaire', description: 'bloop' };
        component.newName = 'moop';
        component.newDescription = 'boop';
        component.modifyDict();
        expect(adminServiceSpy.editDictionary).toHaveBeenCalledWith('Mon dictionnaire', 'moop', 'boop');
    });

    it("modifyVirtualPlayer should keep the original difficulty if the user didn't enter any.", () => {
        component.originalValues.virtualPlayer = { vpName: 'Daria', vpDifficulty: VirtualPlayerDifficulty.BEGINNER };
        component.newName = 'bloop';
        component.modifyVirtualPlayer();
        expect(adminServiceSpy.editVirtualPlayer).toHaveBeenCalledWith('Daria', 'bloop', VirtualPlayerDifficulty.BEGINNER);
    });

    it("modifyVirtualPlayer should keep the original name if the user didn't enter any.", () => {
        component.originalValues.virtualPlayer = { vpName: 'Daria', vpDifficulty: VirtualPlayerDifficulty.BEGINNER };
        component.newDifficulty = VirtualPlayerDifficulty.EXPERT;
        component.modifyVirtualPlayer();
        expect(adminServiceSpy.editVirtualPlayer).toHaveBeenCalledWith('Daria', 'Daria', VirtualPlayerDifficulty.EXPERT);
    });

    it('modifyVirtualPlayer should update the name and the difficulty if the user changes them.', () => {
        component.originalValues.virtualPlayer = { vpName: 'Daria', vpDifficulty: VirtualPlayerDifficulty.BEGINNER };
        component.newName = 'bloop';
        component.newDifficulty = VirtualPlayerDifficulty.EXPERT;
        component.modifyVirtualPlayer();
        expect(adminServiceSpy.editVirtualPlayer).toHaveBeenCalledWith('Daria', 'bloop', VirtualPlayerDifficulty.EXPERT);
    });

    it('The selection input should have débutant and expert as options.', () => {
        fixture.detectChanges();
        const select: HTMLSelectElement = fixture.debugElement.query(By.css('#dropdown')).nativeElement;
        expect(select.options[1].value).toEqual(VirtualPlayerDifficulty.BEGINNER);
        expect(select.options[2].value).toEqual(VirtualPlayerDifficulty.EXPERT);
    });

    it('getOption should set newDifficulty to débutant if the user selects this option.', () => {
        const select: HTMLSelectElement = fixture.debugElement.query(By.css('#dropdown')).nativeElement;
        select.value = select.options[1].value;
        select.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(component.newDifficulty).toEqual(VirtualPlayerDifficulty.BEGINNER);
    });

    it('getOption should set newDifficulty to expert if the user selects this option.', () => {
        const select: HTMLSelectElement = fixture.debugElement.query(By.css('#dropdown')).nativeElement;
        select.value = select.options[2].value;
        select.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(component.newDifficulty).toEqual(VirtualPlayerDifficulty.EXPERT);
    });
});
