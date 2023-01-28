/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state.service';

describe('GameStateService', () => {
    let service: GameStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit reconnect when calling reconnect', () => {
        const reconnectSpy = spyOn(service['socket'], 'emit');
        service.reconnect('test');
        expect(reconnectSpy).toHaveBeenCalledWith('reconnect', 'test');
    });
});
