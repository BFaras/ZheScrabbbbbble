import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Dictionary } from '@app/classes/dictionary';
import { Game } from '@app/classes/game';
import { VirtualPlayerDifficulty } from '@app/classes/virtual-player-difficulty';
import { VirtualPlayerInfo } from '@app/classes/virtual-player-info';
import { VirtualPlayerInputs } from '@app/classes/virtual-player-inputs';
import { AdminPopUpComponent } from '@app/components/admin-pop-up/admin-pop-up.component';
import { AdminService, DatabaseType } from '@app/services/admin-service/admin.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements AfterViewInit, OnDestroy {
    columns: string[] = ['date', 'heure début', 'durée', 'joueur 1', 'score', 'virtuel', 'joueur 2', 'score', 'virtuel', 'mode', 'abandon'];
    dictData: Dictionary = {
        title: '',
        description: '',
    };
    virtualPlayerData: VirtualPlayerInputs = {
        vpName: '',
        vpDifficulty: VirtualPlayerDifficulty.BEGINNER,
    };
    newFile: FileList;
    formType: string;
    virtualPlayers: VirtualPlayerInfo[];
    dictList: Dictionary[] = [];

    gameHistory: Game[] = [];
    subscriptions: Subscription[] = [];

    constructor(public dialog: MatDialog, private readonly adminService: AdminService, private readonly communicationService: CommunicationService) {}

    ngAfterViewInit() {
        this.subscriptions.push(this.adminService.getVirtualPlayerNamesObservable().subscribe((names) => (this.virtualPlayers = names)));
        this.subscriptions.push(this.adminService.getGameHistoryObservable().subscribe((history) => (this.gameHistory = history)));
        this.subscriptions.push(this.adminService.getDictionariesObservable().subscribe((dicts) => (this.dictList = dicts)));
        this.subscriptions.push(this.adminService.getErrorObservable().subscribe((error) => confirm(error)));
        this.adminService.getVirtualPlayerNames();
        this.adminService.getGameHistory();
        this.adminService.getDictionaries();
    }

    ngOnDestroy() {
        for (const sub of this.subscriptions) sub.unsubscribe();
    }

    openForm() {
        this.dialog.open(AdminPopUpComponent, {
            width: '650px',
            height: '320px',
            panelClass: 'my-dialog',
            data: { dict: this.dictData, virtualPlayer: this.virtualPlayerData, formType: this.formType },
        });
    }

    deleteDict() {
        if (confirm('Êtes-vous sûr(e) de vouloir supprimer ce dictionnaire?')) this.adminService.deleteDictionary(this.dictData.title);
    }

    deleteVirtualPlayer() {
        if (confirm('Êtes-vous sûr(e) de vouloir supprimer ce joueur virtuel?')) this.adminService.deleteVirtualPlayer(this.virtualPlayerData.vpName);
    }

    alertResetType(message: string, type: DatabaseType) {
        if (confirm(message)) this.adminService.resetDatabaseType(type);
    }

    alertResetAll() {
        const message1 = 'Êtes-vous sûr(e) de vouloir réinitialiser toutes les données?';
        const message2 = ' Tout sera perdu sauf les valeurs par défaut. Cela prendra environ 10 secondes.';
        if (confirm(message1 + message2)) this.adminService.resetDatabase();
    }

    async submitFile(element: HTMLInputElement) {
        try {
            const dict = JSON.parse(await this.newFile[0]?.text()) as Dictionary;
            if (!this.adminService.checkIfValidDict(dict)) throw new Error('InvalidDictionaryException');
            this.communicationService.postDictionary(dict as Dictionary)?.subscribe(() => this.adminService.getDictionaries());
        } catch (e) {
            confirm('Ce dictionaire a un format invalide. Veuillez télécharger le dictionaire par défaut afin de voir le format voulu.');
        }
        element.value = '';
    }

    getFile(event: Event) {
        this.newFile = (event.target as HTMLInputElement).files as FileList;
    }

    downloadDictionary(title: string) {
        this.communicationService.getDictionary(title)?.subscribe((dict: Dictionary) => this.sendDownloadToBrowser(dict));
    }

    sendDownloadToBrowser(dict: Dictionary) {
        const a = document.createElement('a');
        const file = new Blob([JSON.stringify(dict)], { type: 'text/plain' });
        a.href = URL.createObjectURL(file);
        a.download = `${dict.title}.json`;
        a.click();
    }

    get databaseType(): typeof DatabaseType {
        return DatabaseType;
    }
}
