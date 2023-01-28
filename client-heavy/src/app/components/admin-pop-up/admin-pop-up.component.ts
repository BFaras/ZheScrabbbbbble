import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataType } from '@app/classes/data-type';
import { Dictionary } from '@app/classes/dictionary';
import { AdminService } from '@app/services/admin-service/admin.service';

@Component({
    selector: 'app-admin-pop-up',
    templateUrl: './admin-pop-up.component.html',
    styleUrls: ['./admin-pop-up.component.scss'],
})
export class AdminPopUpComponent {
    newName: string;
    newDifficulty: string;
    newDescription: string;
    originalValues: DataType;
    dictionnaries: Dictionary[];
    constructor(
        public dialogRef: MatDialogRef<AdminPopUpComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DataType,
        private readonly adminService: AdminService,
    ) {
        this.originalValues = data;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submitInput() {
        this.onNoClick();
        switch (this.originalValues.formType) {
            case 'virtualPlayer':
                if (!this.originalValues.virtualPlayer.vpName) {
                    this.addVirtualPlayer();
                } else {
                    this.modifyVirtualPlayer();
                    this.originalValues.virtualPlayer.vpName = '';
                }
                break;
            case 'dictionary':
                this.modifyDict();
                break;
        }
    }

    getOption(event: Event) {
        this.newDifficulty = (event.target as HTMLSelectElement).value;
    }

    addVirtualPlayer() {
        if (this.newName && this.newDifficulty) this.adminService.addVirtualPlayer(this.newName, this.newDifficulty);
        else window.alert('Veuillez remplir tous les champs.');
    }

    modifyDict() {
        const newName = this.newName ? this.newName : this.originalValues.dict.title;
        const description = this.newDescription ? this.newDescription : this.originalValues.dict.description;
        this.adminService.editDictionary(this.originalValues.dict.title, newName, description);
    }

    modifyVirtualPlayer() {
        const newName = this.newName ? this.newName : this.originalValues.virtualPlayer.vpName;
        const difficulty = this.newDifficulty ? this.newDifficulty : this.originalValues.virtualPlayer.vpDifficulty;
        this.adminService.editVirtualPlayer(this.originalValues.virtualPlayer.vpName, newName, difficulty);
    }
}
