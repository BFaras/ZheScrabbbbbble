import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { GRID_CONSTANTS } from '@app/constants/grid-constants';
import { MouseButton } from '@app/constants/mouse-buttons';
import { GameState, GameStateService } from '@app/services/game-state-service/game-state.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
    @Input() receiver: string;
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    buttonPressed = '';
    subscription: Subscription;
    mouseIsIn: boolean = false;
    mousePosition: Vec2 = { x: 0, y: 0 };
    viewLoaded : boolean = false;
    private initialGameState: GameState;
    private canvasSize = { x: GRID_CONSTANTS.defaultWidth, y: GRID_CONSTANTS.defaultHeight };

    constructor(
        private readonly gridService: GridService,
        private readonly gameStateService: GameStateService,
        private readonly letterAdderService: LetterAdderService,
    ) {
        this.subscription = this.gameStateService.getGameStateObservable().subscribe(async (gameState) => {
            if(this.viewLoaded){
                this.updateBoardState(gameState)
            }else{
                this.initialGameState = gameState;
            }
        });
    }

    slideLetterToCanvas(letter:CdkDragDrop<string[]>){
        const leftBoard = document.getElementById("canvas")?.getBoundingClientRect().left as number;
        const topBorad = document.getElementById("canvas")?.getBoundingClientRect().top as number;
        this.setReceiver('playarea');
        const coordinateClick: Vec2 = { x: letter.dropPoint.x - leftBoard, y: letter.dropPoint.y - topBorad };
        this.mouseIsIn = true;
        if (this.letterAdderService.onDropLetterSpot(coordinateClick)){
            this.letterAdderService.addLettersOnDrop(letter.item.data)
        }

        
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        this.letterAdderService.onPressDown(this.buttonPressed);
    }

    ngOnInit(): void {
        this.letterAdderService.resetMappedBoard();
    }

    ngAfterViewInit(): void {
        this.viewLoaded = true;
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.drawIdentificators();
        this.gridService.drawSquares();
        this.gridService.drawGridLines();
        this.updateBoardState(this.initialGameState);
    }

    ngOnChanges() {
        if (this.receiver !== 'playarea') this.letterAdderService.removeAll();
    }

    setReceiver(receiver: string) {
        this.receiver = receiver;
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.setReceiver('playarea');
            const coordinateClick: Vec2 = { x: event.offsetX, y: event.offsetY };
            this.letterAdderService.onLeftClick(coordinateClick);
            this.mouseIsIn = true;
        }
    }

    private async updateBoardState(gameState: GameState) {
        this.gridService.setBoardState(gameState.board);
        this.letterAdderService.setBoardState(gameState.board);
        this.letterAdderService.removeAll();
    }
}
