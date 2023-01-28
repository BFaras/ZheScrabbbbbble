import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { isManipulated, isSelected } from '@app/constants/letters-constants';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { ManipulationRackService } from './manipulation-rack.service';

describe('SelectionRackService', () => {
    let service: ManipulationRackService;
    let holderService: LetterHolderService;
    let ctxStub: CanvasRenderingContext2D;
    const CANVAS_WIDTH = 480;
    const CANVAS_HEIGHT = 60;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ManipulationRackService);
        holderService = TestBed.inject(LetterHolderService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        holderService.holderContext = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should do nothing if another direction that left or right is being done', () => {
        const testHand = ['a', 'i', 'e'];
        const testPosition = 2;
        expect(service.moveLetter('up', testPosition, testHand)).toBeUndefined();
    });

    it('should toggle the boolean value of a given position when setSelection is called', () => {
        const selectionTest: { [key: string]: boolean } = { 1: false, 2: true };
        const selectedPosition = 1;
        service.setSelection(selectedPosition, selectionTest);
        expect(selectionTest).toEqual({ 1: true, 2: true });
    });

    it('should toggle the boolean value to initial value after deselection when setSelection is called', () => {
        const selectionTest: { [key: string]: boolean } = { 1: false, 2: true };
        const selectedPosition = 1;
        service.setSelection(selectedPosition, selectionTest);
        service.setSelection(selectedPosition, selectionTest);
        expect(selectionTest).toEqual({ 1: false, 2: true });
    });

    it('should call setManipulation when manipulateRackOnKey is called', () => {
        const spySetManip = spyOn(service, 'setManipulation');
        const positionTest = 1;
        service.cancelAll(isSelected);
        service.manipulateRackOnKey(positionTest);
        expect(spySetManip).toHaveBeenCalled();
    });

    it('should call drawSelection (first time all false) when given a position', () => {
        service.cancelAll(isSelected);
        service.cancelAll(isManipulated);
        const drawSpy = spyOn(holderService, 'drawSelection').and.callThrough();
        service.selectLetterOnRack(1);
        expect(drawSpy).toHaveBeenCalled();
    });

    it('should call removeSelection when given a position two times', () => {
        service.cancelAll(isSelected);
        service.cancelAll(isManipulated);
        const removeSpy = spyOn(holderService, 'removeSelection').and.callThrough();
        service.selectLetterOnRack(1);
        service.selectLetterOnRack(1);
        expect(removeSpy).toHaveBeenCalled();
    });

    it('should call cancelManipulation and setSelection if one position is already manipulated', () => {
        service.setManipulation(1, isManipulated);
        const selectionSpy = spyOn(service, 'setSelection');
        const cancelManip = spyOn(service, 'cancelManipulation');
        service.selectLetterOnRack(1);
        expect(selectionSpy).toHaveBeenCalled();
        expect(cancelManip).toHaveBeenCalled();
    });

    it('should call drawManipulation if key is pressed and letter is in hand', () => {
        service.cancelAll(isSelected);
        service.cancelAll(isManipulated);
        service.setManipulation(1, isManipulated);
        const drawManipSpy = spyOn(holderService, 'drawManipulation');
        service.manipulateRackOnKey(1);
        expect(drawManipSpy).toHaveBeenCalled();
    });
});
