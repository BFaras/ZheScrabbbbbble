import { Component } from '@angular/core';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';

@Component({
    selector: 'app-solo-multi-page',
    templateUrl: './solo-multi-page.component.html',
    styleUrls: ['./solo-multi-page.component.scss'],
})
export class SoloMultiPageComponent {
    constructor(private gameModeService: GameModeService) {}

    setSoloMode(isSoloMode: boolean): void {
        this.gameModeService.setGameMode(isSoloMode);
    }
}
