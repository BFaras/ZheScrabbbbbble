import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Vec2 } from '@app/classes/vec2';
import { COLUMNS, GRID_CONSTANTS, ROWS } from '@app/constants/grid-constants';
import { LETTER_POINTS } from '@app/constants/letters-constants';
import { MouseButton } from '@app/constants/mouse-buttons';
import { AccountService } from '@app/services/account-service/account.service';
import { GameState, GameStateService } from '@app/services/game-state-service/game-state.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { PreviewPlayersActionService } from '@app/services/preview-players-action-service/preview-players-action.service';
import { SnackBarHandlerService } from '@app/services/snack-bar-handler.service';
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

    addTilePreviewSubscription: Subscription
    removeTilePreviewSubscription: Subscription
    constructor(
        private readonly accountService: AccountService,
        private readonly gridService: GridService,
        private readonly gameStateService: GameStateService,
        private readonly letterAdderService: LetterAdderService,
        public readonly dialogBlankTile: MatDialog,
        private previewFirstTileService: PreviewPlayersActionService,
        private GameStateService: GameStateService,
        private snackBackHandler: SnackBarHandlerService,
        private previewPlayerActionService: PreviewPlayersActionService
    ) {
        this.initializePreviewTileIfCoop()
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
        this.previewFirstTileService.setUpSocket()
        this.addTilePreviewSubscription = this.previewFirstTileService.getActivePlayerFirstTile().subscribe((position) => {
            this.gridService.deleteActivePlayerFirstTile(position.position, this.letterAdderService.addedLettersLog)
            const listPlayersFirstTilesCoopArray = Array.from(this.previewPlayerActionService.listPlayersFirstTilesCoop.values())
            listPlayersFirstTilesCoopArray.forEach((position) => {
                this.gridService.showActivePlayerFirstTile(position)
            })
        })

        this.removeTilePreviewSubscription = this.previewFirstTileService.getSelectedTileStatus().subscribe((position) => {
            console.log("remove a first tile")
            console.log(this.previewFirstTileService.verifyPositionExistInListPlayerTile(position.position))
            if (this.GameStateService.isCoop()) {
                if (!this.previewFirstTileService.verifyPositionExistInListPlayerTile(position.position)) {
                    console.log("remove a first tile coop" + position.username)
                    this.gridService.deleteActivePlayerFirstTile(position.position, this.letterAdderService.addedLettersLog)
                    const listPlayersFirstTilesCoopArray = Array.from(this.previewPlayerActionService.listPlayersFirstTilesCoop.values())
                    listPlayersFirstTilesCoopArray.forEach((position) => {
                        this.gridService.showActivePlayerFirstTile(position)
                    })
                }
            } else {
                this.gridService.deleteActivePlayerFirstTile(position.position)
            }
        })
    }


    initializePreviewTileIfCoop() {
        this.previewFirstTileService.setUpPreviewPartnerFirstTileCoop(undefined)
    }
    getPointIfNotBlank(letter: string) {
        const upperCase = letter.toUpperCase();
        if (letter === upperCase) return 0;
        return LETTER_POINTS[letter.toUpperCase() as keyof typeof LETTER_POINTS]
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

    changePosition(event: CdkDragDrop<string>, field: { top: string; left: string; text: string }) {
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
            if (this.letterAdderService.onDropLetterSpot(coordinateClick)) {
                const tile = this.letterAdderService.getDroppedSpot(coordinateClick.x, coordinateClick.y);
                let newField: { top: string; left: string; text: string } = {
                    top: ROWS[tile.row] + "px",
                    left: COLUMNS[tile.column] + "px",
                    text: field.text

                }
                this.changeTilePositionLastMovedTile(field, newField)
                this.letterAdderService.moveLetterInBoard(field.text)
                /*il faut que e soit dans cet ordre pour enlever les dessin quand je bouge */
                this.letterAdderService.removeDrawingBeforeDragWithinCanvas()

            } else {
                /**Il faut ca remet dans la main  */
                this.letterAdderService.removeDrawingBeforeDragOutsideCanvasOrNotValidSpot()
                this.fields = this.fields.filter((x) => x != field);
            }
        } else {
            this.fields = this.fields.filter((x) => x != field);
            /**Il faut ca remet dans la main  */
            this.letterAdderService.removeDrawingBeforeDragOutsideCanvasOrNotValidSpot()
        }

    }
    slideLetterToCanvas(letter: CdkDragDrop<string>) {
        if (letter.previousContainer === letter.container) {
            return;
        } else {
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
            width: '450px',
            height: '230px',
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

    changeTilePositionLastMovedTile(field: { top: string; left: string; text: string }, newField: { top: string; left: string; text: string }) {
        this.fields.splice(this.fields.indexOf(field), 1)
        this.fields.push(newField)
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
        this.addTilePreviewSubscription.unsubscribe()
        this.removeTilePreviewSubscription.unsubscribe()
        this.snackBackHandler.closeAlert();
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
