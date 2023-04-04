import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Vec2 } from '@app/classes/vec2';
import { COLUMNS, GRID_CONSTANTS, ROWS } from '@app/constants/grid-constants';
import { MouseButton } from '@app/constants/mouse-buttons';
import { AccountService } from '@app/services/account-service/account.service';
import { GameState, GameStateService } from '@app/services/game-state-service/game-state.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { Subscription } from 'rxjs';
import { BlankTilePopUpComponent } from '../blank-tile-pop-up/blank-tile-pop-up.component';
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
    viewLoaded: boolean = false;
    formerAdderMode: string = "";
    blankLetterOnDrop: string;
    fields: any[] = []
    private gameState: GameState;
    private canvasSize = { x: GRID_CONSTANTS.defaultWidth, y: GRID_CONSTANTS.defaultHeight };

    constructor(
        private readonly accountService: AccountService,
        private readonly gridService: GridService,
        private readonly gameStateService: GameStateService,
        private readonly letterAdderService: LetterAdderService,
        public readonly dialogBlankTile: MatDialog,
    ) {
        this.subscription = this.gameStateService.getGameStateObservable().subscribe(async (gameState) => {
            if (this.viewLoaded) {
                this.updateBoardState(gameState)
            }
            this.gameState = gameState;
        });
    }

    addField(tile: any, index: number) {
        this.fields.splice(index, 0, tile);
    }

    fakeDroppedOnCanvas(event: CdkDragDrop<string[]>, coordinateClick: Vec2) {

        let tile = {
            top: ROWS[this.letterAdderService.activeSquare.x] + 'px',
            left: COLUMNS[this.letterAdderService.activeSquare.y] + 'px',
            text: event.item.data as string
        }
        this.addField({ ...tile }, event.currentIndex);
    }

    changePosition(event: CdkDragDrop<any>, field: { top: string; left: string; text: string }) {
        console.log('change position');
        this.setReceiver('playarea');
        const leftBoard = document.getElementById("canvas")?.getBoundingClientRect().left as number;
        const topBorad = document.getElementById("canvas")?.getBoundingClientRect().top as number;
        const top = event.dropPoint.y - topBorad
        const left = event.dropPoint.x - leftBoard
        const coordinateClick: Vec2 = { x: left, y: top };
        const out =
            top < 0 ||
            left < 0 ||
            top > 800 ||
            left > 800
        if (!out) {
            console.log("infield")
            console.log(coordinateClick)
            if (this.letterAdderService.onDropLetterSpot(coordinateClick)) {
                console.log("letter  in apporprite drop spot")
                console.log('change position')
                this.letterAdderService.removeDrawingBeforeDragWithinCanvas()
                field.left = left + "px"
                field.top = top + "px";
                this.letterAdderService.moveLetterInBoard(field.text)
            } else {
                /**logique doit etre modifier pour que ca remet dans sport  */
                this.fields = this.fields.filter((x) => x != field);
                console.log("letter not in apporprite drop spot , so it s has been removed")
                this.letterAdderService.removeLetters()
                event.item._dragRef.dispose();
            }
        } else {
            this.fields = this.fields.filter((x) => x != field);
            console.log("letter not in apporprite drop spot , so it s has been removed")
            /**le remove letter est a modifier pour que ca prenne moins de temops */
            this.letterAdderService.removeLetters()
            event.item._dragRef.dispose();
        }

    }
    slideLetterToCanvas(letter: CdkDragDrop<string[]>) {
        if (letter.previousContainer === letter.container) {
            console.log('in the sliding and same container')
        } else {
            console.log('in the sliding and not the same container')
            const leftBoard = document.getElementById("canvas")?.getBoundingClientRect().left as number;
            const topBorad = document.getElementById("canvas")?.getBoundingClientRect().top as number;
            this.setReceiver('playarea');
            const coordinateClick: Vec2 = { x: letter.dropPoint.x - leftBoard, y: letter.dropPoint.y - topBorad };
            if (letter.item.data === 'blank') {
                if (this.letterAdderService.canDrop(coordinateClick)) {
                    this.formerAdderMode = this.letterAdderService.letterAdderMode;
                    this.letterAdderService.setAdderMode('dragAndDrop');
                    this.openBlankTileDialog(letter, coordinateClick)
                    return;
                }
                this.blankLetterOnDrop = "";
                letter.item._dragRef.reset()
                return;
            }
            if (this.letterAdderService.onDropLetterSpot(coordinateClick)) {
                this.fakeDroppedOnCanvas(letter, coordinateClick);
                console.log(letter.item._dragRef.data.element.nativeElement)
                this.letterAdderService.addLettersOnDrop(letter.item.data)
            }
            this.mouseIsIn = true;

        }
    }

    openBlankTileDialog(letter: CdkDragDrop<any[]>, coord: Vec2) {
        const dialogReference = this.dialogBlankTile.open(BlankTilePopUpComponent, {
            width: '250px',
            height: '250px',
        });
        dialogReference.afterClosed().subscribe(result => {
            this.letterAdderService.setAdderMode(this.formerAdderMode);
            if (result.letter) {
                this.blankLetterOnDrop = result.letter;

                if (this.letterAdderService.onDropLetterSpot(coord)) {
                    this.letterAdderService.addLettersOnDrop(this.blankLetterOnDrop)
                }
            }
        });
    }
    @HostListener('document:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.receiver === "playarea") {
            if (this.gameState.players[this.gameState.playerTurnIndex].username !== this.accountService.getUsername()) return;
            this.buttonPressed = event.key;
            this.letterAdderService.onPressDown(this.buttonPressed);
        }
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
        this.updateBoardState(this.gameState);
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
            if (this.gameStateService.getObserverIndex() >= 0) return;
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
