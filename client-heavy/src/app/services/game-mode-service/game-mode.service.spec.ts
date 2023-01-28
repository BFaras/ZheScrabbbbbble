/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { GameType } from '@app/classes/game-settings';
import { GameModeService } from './game-mode.service';

describe('GameModeService', () => {
    let service: GameModeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change value of isSoloMode when set game mode is called', () => {
        service['isSoloMode'] = true;
        service.setGameMode(false);
        expect(service['isSoloMode']).toBeFalse();
    });

    it('should change value of scrabbleMode when called', () => {
        service.setScrabbleMode(GameType.CLASSIC);
        expect(service['scrabbleMode']).toEqual(GameType.CLASSIC);
    });
});
