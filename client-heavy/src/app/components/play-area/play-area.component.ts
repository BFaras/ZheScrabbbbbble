import { CdkDragDrop, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
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
    hoveredElement: any = {}
    private gameState: GameState;
    private canvasSize = { x: GRID_CONSTANTS.defaultWidth, y: GRID_CONSTANTS.defaultHeight };

    public dragStart: any = { top: 0, left: 0, text: '' };
    public dragEnd: any = { top: 0, left: 0, text: '' };

    constructor(
        private readonly accountService: AccountService,
        private readonly gridService: GridService,
        private readonly gameStateService: GameStateService,
        private readonly letterAdderService: LetterAdderService,
        public readonly dialogBlankTile: MatDialog,
        private renderer: Renderer2,
    ) {
        this.subscription = this.gameStateService.getGameStateObservable().subscribe(async (gameState) => {
            if (this.viewLoaded) {
                this.updateBoardState(gameState)
                this.fields = []
            }
            this.gameState = gameState;
        });

        this.letterAdderService.getLetterNotAcceptedObservable().subscribe((status) => {
            if (status) {
                this.fields = [];
            }
        })
    }

    addField(tile: any, index: number) {
        this.fields.push(tile);
    }

    fakeDroppedOnCanvas(event: CdkDragDrop<string>, coordinateClick: Vec2) {

        let tile = {
            top: ROWS[this.letterAdderService.activeSquare.x] + 'px',
            left: COLUMNS[this.letterAdderService.activeSquare.y] + 'px',
            text: event.item.data as string
        }
        this.addField({ ...tile }, event.currentIndex);
    }

    hoverElement(event: CdkDragMove, field: { top: string; left: string; text: string }) {
        console.log('hover')
        /*
        const leftBoard = document.getElementById("canvas")?.getBoundingClientRect().left as number;
        const topBorad = document.getElementById("canvas")?.getBoundingClientRect().top as number;
        let left = event.pointerPosition.x - leftBoard
        let top = event.pointerPosition.y - topBorad;
        const tile = this.letterAdderService.getDroppedSpot(left, top)
        this.hoveredElement.left = COLUMNS[tile.column];
        this.hoveredElement.top = ROWS[tile.row];
        console.log(COLUMNS[tile.column]);
        console.log(ROWS[tile.row])
        */


    }
    /** */
    dragStarted(event: CdkDragStart, field: { top: string; left: string; text: string }) {
        console.log('quand je commence a drag')
    }

    public dragEnded(event: CdkDragEnd, field: { top: string; left: string; text: string }): void {
        console.log('quand je lache la lettre')
        /*
        field.top = this.hoveredElement.top + 'px'
        field.left = this.hoveredElement.left + 'px'
        console.log(field)
        */
        this.renderer.setStyle(event.source.element.nativeElement, 'opacity', '50%');

    }
    changePosition(event: CdkDragDrop<string>, field: { top: string; left: string; text: string }) {
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
        const foundCoords = this.letterAdderService.findCoords(Number(field.left.replace('px', '')), Number(field.top.replace('px', '')));
        this.letterAdderService.pervForDrag.x = foundCoords.row
        this.letterAdderService.pervForDrag.y = foundCoords.column
        this.letterAdderService.pervForDrag.text = field.text;
        if (!out) {
            console.log("infield")
            if (this.letterAdderService.onDropLetterSpot(coordinateClick)) {
                console.log("letter  in apporprite drop spot")
                field.top = top + "px"
                field.left = left + 'px'
                this.letterAdderService.removeDrawingBeforeDragWithinCanvas()
                this.changeTilePositionLastMovedTile(field)
                this.letterAdderService.moveLetterInBoard(field.text)
            } else {
                /**Il faut ca remet dans la main  */
                console.log("letter not in apporprite drop spot , so it s has been removed")
                this.letterAdderService.removeDrawingBeforeDragOutsideCanvasOrNotValidSpot()
                this.fields = this.fields.filter((x) => x != field);
            }
        } else {
            console.log("letter not in apporprite drop spot , so it s has been removed")
            this.fields = this.fields.filter((x) => x != field);
            /**Il faut ca remet dans la main  */
            this.letterAdderService.removeDrawingBeforeDragOutsideCanvasOrNotValidSpot()
        }

    }
    slideLetterToCanvas(letter: CdkDragDrop<string>) {
        if (letter.previousContainer === letter.container) {
            return;
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
                this.letterAdderService.addLettersOnDrop(letter.item.data)
            }
            this.mouseIsIn = true;

        }
    }

    openBlankTileDialog(letter: CdkDragDrop<string>, coord: Vec2) {
        const dialogReference = this.dialogBlankTile.open(BlankTilePopUpComponent, {
            width: '250px',
            height: '250px',
            panelClass: 'container-blank-letter'
        });
        dialogReference.afterClosed().subscribe(result => {
            if (result.letter) {
                this.blankLetterOnDrop = result.letter;

                if (this.letterAdderService.onDropLetterSpot(coord)) {
                    letter.item.data = this.blankLetterOnDrop;
                    this.fakeDroppedOnCanvas(letter, coord);
                    this.letterAdderService.addLettersOnDrop(this.blankLetterOnDrop)
                }
            } else {
                this.letterAdderService.setAdderMode(this.formerAdderMode);
            }
        });
    }
    @HostListener('document:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.receiver === "playarea") {
            if (this.gameStateService.isCoop()) {
                if (this.gameStateService.hasPendingAction() || this.gameStateService.getObserverIndex() !== -1) return;
            } else {
                if (this.gameState.players[this.gameState.playerTurnIndex].username !== this.accountService.getUsername()) return;
            }
            this.buttonPressed = event.key;
            this.letterAdderService.onPressDown(this.buttonPressed);
            this.removeTileDraggedIntoBoard(event);
        }
    }

    changeTilePositionLastMovedTile(field: { top: string; left: string; text: string }) {

        this.fields.push(this.fields.splice(this.fields.indexOf(field), 1)[0])
    }

    removeTileDraggedIntoBoard(event: KeyboardEvent) {
        if (this.fields && event.key === "Backspace") {
            this.fields.pop();
        }
        else if (this.fields && event.key === "Escape") {
            this.fields = [];
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
            if (this.gameStateService.getObserverIndex() >= 0 || this.gameStateService.hasPendingAction()) return;
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
