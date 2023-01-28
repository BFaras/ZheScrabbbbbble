/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Goal } from '@app/classes/goal';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { GameState } from '@app/services/game-state-service/game-state.service';
import { TimerComponent } from '../timer/timer.component';

describe('InfoPanelComponent', () => {
    let component: InfoPanelComponent;
    let fixture: ComponentFixture<InfoPanelComponent>;
    let gameState: GameState;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfoPanelComponent, TimerComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfoPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.onGoingPublicObjectives = [];
        component.areGoals = false;
        gameState = {
            board: [[]],
            hand: ['a', 'a', 'a'],
            opponentHandLength: 7,
            isYourTurn: true,
            yourScore: 10,
            opponentScore: 10,
            reserveLength: 80,
            gameOver: false,
            boardWithInvalidWords: undefined,
            yourGoals: [
                {
                    title: 'Test',
                    points: 2,
                    completed: false,
                    progress: [
                        {
                            playerName: 'joueur1',
                            playerProgress: 1,
                        },
                        {
                            playerName: 'joueur2',
                            playerProgress: 0,
                        },
                    ],
                    progressMax: 2,
                },
                {
                    title: 'Test2',
                    points: 2,
                    completed: false,
                    progress: [
                        {
                            playerName: 'joueur1',
                            playerProgress: 1,
                        },
                        {
                            playerName: 'joueur2',
                            playerProgress: 0,
                        },
                    ],
                    progressMax: 2,
                },
                {
                    title: 'Test3',
                    points: 5,
                    completed: false,
                    progress: [
                        {
                            playerName: 'joueur1',
                            playerProgress: 1,
                        },
                        {
                            playerName: 'joueur2',
                            playerProgress: 0,
                        },
                    ],
                    progressMax: 5,
                },
            ],
            oppenentGoals: [
                {
                    title: 'Test',
                    points: 2,
                    completed: false,
                    progress: [
                        {
                            playerName: 'joueur1',
                            playerProgress: 1,
                        },
                        {
                            playerName: 'joueur2',
                            playerProgress: 0,
                        },
                    ],
                    progressMax: 2,
                },
                {
                    title: 'Test2',
                    points: 2,
                    completed: false,
                    progress: [
                        {
                            playerName: 'joueur1',
                            playerProgress: 1,
                        },
                        {
                            playerName: 'joueur2',
                            playerProgress: 0,
                        },
                    ],
                    progressMax: 2,
                },
                {
                    title: 'Test3',
                    points: 8,
                    completed: false,
                    progress: [
                        {
                            playerName: 'joueur1',
                            playerProgress: 1,
                        },
                        {
                            playerName: 'joueur2',
                            playerProgress: 0,
                        },
                    ],
                    progressMax: 8,
                },
            ],
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update letter counts when standard game update is called', () => {
        component['standardGameUpdate'](gameState);
        expect(component['playersInfo'][0].letterCount).toEqual(3);
        expect(component['playersInfo'][1].letterCount).toEqual(7);
        expect(component['roundInfo'][0].lettersRemaining).toEqual(80);
    });

    it('should make both players winners when endGame is called with equal score', () => {
        component['endGame'](gameState);
        expect(component['playersInfo'][0].winner).toBeTruthy();
        expect(component['playersInfo'][1].winner).toBeTruthy();
        expect(component['playersInfo'][0].active).toBeFalsy();
        expect(component['playersInfo'][1].active).toBeFalsy();
    });

    it('should make the player with the highest score the winner', () => {
        gameState.opponentScore = 9;
        component['endGame'](gameState);
        expect(component['playersInfo'][0].winner).toBeTruthy();
        expect(component['playersInfo'][1].winner).toBeFalsy();
        gameState.opponentScore = 11;
        component['endGame'](gameState);
        expect(component['playersInfo'][1].winner).toBeTruthy();
        expect(component['playersInfo'][0].winner).toBeFalsy();
    });

    it('should show a resonable score if the score is impossibly small due to disconnect', () => {
        gameState.opponentScore = -999;
        gameState.yourScore = -999;
        component['endGame'](gameState);
        expect(component['playersInfo'][0].currentScore).toEqual(1);
        expect(component['playersInfo'][1].currentScore).toEqual(1);
    });

    it('should set active player updating turn display', () => {
        component['updateTurnDisplay'](gameState);
        expect(component['playersInfo'][0].active).toBeTruthy();
        expect(component['playersInfo'][1].active).toBeFalsy();
        gameState.isYourTurn = false;
        component['updateTurnDisplay'](gameState);
        expect(component['playersInfo'][1].active).toBeTruthy();
        expect(component['playersInfo'][0].active).toBeFalsy();
    });

    it('should call set end game if game is over when updating turn display', () => {
        gameState.gameOver = true;
        component['updateTurnDisplay'](gameState);
        expect(component['playersInfo'][0].winner).toBeTruthy();
        expect(component['playersInfo'][1].winner).toBeTruthy();
        expect(component['playersInfo'][0].active).toBeFalsy();
        expect(component['playersInfo'][1].active).toBeFalsy();
    });

    it('should change the name on the info pannel when calling updatePlayerNames', () => {
        component['playersInfo'][0].name = 'testA1';
        component['playersInfo'][1].name = 'testA2';
        component['updatePlayerNames'](['testB1', 'testB2']);
        expect(component['playersInfo'][0].name).toEqual('testB1');
        expect(component['playersInfo'][1].name).toEqual('testB2');
    });

    it('should update onGoingPublicObjectives when turn is updated', () => {
        component.areGoals = true;
        const goalsTest = gameState.yourGoals as Goal[];
        const opponantGoalsTest = gameState.oppenentGoals as Goal[];
        const result = [goalsTest[0], goalsTest[1]];
        component['updateTurnDisplay'](gameState);
        expect(component['playersInfo'][0].objectives).toEqual(goalsTest);
        expect(component['playersInfo'][1].objectives).toEqual(opponantGoalsTest);
        expect(component['onGoingPublicObjectives']).toEqual(result);
    });
});
