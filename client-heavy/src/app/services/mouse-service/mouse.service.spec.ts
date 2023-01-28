/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { isManipulated, isSelected } from '@app/constants/letters-constants';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { ManipulationRackService } from '@app/services/manipulation-rack-service/manipulation-rack.service';
import { MouseService } from './mouse.service';

describe('MouseService', () => {
    let service: MouseService;
    let holderService: LetterHolderService;
    let manipulationService: ManipulationRackService;
    let ctxStub: CanvasRenderingContext2D;
    const CANVAS_WIDTH = 480;
    const CANVAS_HEIGHT = 60;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MouseService);
        holderService = TestBed.inject(LetterHolderService);
        manipulationService = TestBed.inject(ManipulationRackService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        holderService.holderContext = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the correct position tile depending on the mouse click position', () => {
        service.mousePosition = { x: 10, y: 50 };
        const result = service.getPositionTile();
        expect(result).toBe(1);
    });

    it('should return NaN if mouse position is out of bound', () => {
        service.mousePosition = { x: 1000, y: 50 };
        const result = service.getPositionTile();
        const check = isNaN(result);
        expect(check).toBeTruthy();
    });

    it('should call getPositionTile and drawSelection (first time all false) when coordinate are valid', () => {
        manipulationService.cancelAll(isSelected);
        manipulationService.cancelAll(isManipulated);
        const coordinateTest = { x: 10, y: 100 };
        const spyPosition = spyOn(service, 'getPositionTile').and.callThrough();
        const drawSpy = spyOn(holderService, 'drawSelection').and.callThrough();
        service.selectRack(coordinateTest);

        expect(spyPosition).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('should call getPositionTile and removeSelection when coordinate are valid and we click another time at the same position', () => {
        manipulationService.cancelAll(isSelected);
        manipulationService.cancelAll(isManipulated);
        const coordinateTest = { x: 10, y: 100 };
        const spyPosition = spyOn(service, 'getPositionTile').and.callThrough();
        const removeSpy = spyOn(holderService, 'removeSelection').and.callThrough();
        service.selectRack(coordinateTest);
        service.selectRack(coordinateTest);

        expect(spyPosition).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalled();
    });

    it('should return the corresponding position  manipulateRackOnClick is called', () => {
        const coordinateTest = { x: 10, y: 100 };
        const result = service.manipulateRackOnClick(coordinateTest);
        expect(result).toEqual(1);
    });
});
