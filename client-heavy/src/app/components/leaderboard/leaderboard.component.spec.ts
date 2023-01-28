import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameType } from '@app/constants/game-types';
import { LeaderboardComponent } from './leaderboard.component';

describe('ScoresPageComponent', () => {
    let component: LeaderboardComponent;
    let fixture: ComponentFixture<LeaderboardComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LeaderboardComponent],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(LeaderboardComponent);
                component = fixture.componentInstance;
                fixture.detectChanges();
            });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update the scores variable when calling update scores', () => {
        component.scores = [];
        component.updateScores({ 0: ['testPlayer'] });
        expect(component.scores[0]).toBe('0 : testPlayer');
    });

    it('should change game type when calling set game type', () => {
        const leaderboardSpy = spyOn(component, 'setGameType');
        component.gameType = GameType.CLASSIC;
        component.setGameType(GameType.LOG2990);
        expect(leaderboardSpy).toHaveBeenCalledWith(GameType.LOG2990);
    });
});
