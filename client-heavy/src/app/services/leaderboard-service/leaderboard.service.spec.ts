/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { GameType } from '@app/constants/game-types';
import { LeaderboardService } from './leaderboard.service';

describe('GameStateService', () => {
    let service: LeaderboardService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LeaderboardService);
    });

    it('should emit requestTopScores when requestTopScores is called', () => {
        const sendMessageSpy = spyOn(service['socket'], 'emit');
        service.requestTopScores(GameType.CLASSIC);
        expect(sendMessageSpy).toHaveBeenCalledWith('requestTopScores', 5, GameType.CLASSIC);
    });
});
