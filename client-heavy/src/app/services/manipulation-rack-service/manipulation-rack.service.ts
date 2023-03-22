import { Injectable } from '@angular/core';
import { HOLDER_MEASUREMENTS, isManipulated, isSelected } from '@app/constants/letters-constants';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';

@Injectable({
    providedIn: 'root',
})
export class ManipulationRackService {
    constructor(private letterHolderService: LetterHolderService) {}

    selectLetterOnRack(position: number) {
        this.cancelManipulation();
        this.setSelection(position, isSelected);
        if (!isSelected[position]) {
            this.letterHolderService.removeSelection(position);
        }
    }

    manipulateRackOnKey(position: number) {
        this.cancelAll(isSelected);
        this.setManipulation(position, isManipulated);
    }

    manipulateLetterOnRack(position: number) {
        this.setManipulation(position, isManipulated);
    }

    moveLetter(direction: string, position: number, hand: string[]) {
        let nextPosition: number;
        this.cancelAll(isSelected);
        switch (direction) {
            case 'right':
                nextPosition = position + 1;
                nextPosition = position >= HOLDER_MEASUREMENTS.maxPositionHolder ? 1 : nextPosition;
                this.switchPosition(position, nextPosition, hand);
                this.letterHolderService.changePosition(position, nextPosition);
                break;
            case 'left':
                nextPosition = position - 1;
                nextPosition = position <= 1 ? HOLDER_MEASUREMENTS.maxPositionHolder : nextPosition;
                this.switchPosition(position, nextPosition, hand);
                this.letterHolderService.changePosition(position, nextPosition);
                break;
            default:
                return;
        }
    }

    switchPosition(oldPosition: number, newPosition: number, hand: string[]) {
        [hand[oldPosition - 1], hand[newPosition - 1]] = [hand[newPosition - 1], hand[oldPosition - 1]];
    }

    setSelection(position: number, selectedPosition: { [key: string]: boolean }) {
        selectedPosition[position] = !selectedPosition[position];
    }

    setManipulation(position: number, selectedPosition: { [key: string]: boolean }) {
        this.cancelManipulation();
        selectedPosition[position] = !selectedPosition[position];
    }

    cancelManipulation() {
        Object.keys(isManipulated).forEach((position) => {
            isManipulated[position] = false;
            if (!isSelected[position]) {
                this.letterHolderService.removeSelection(Number(position));
            }
        });
    }

    cancelAll(selectedPosition: { [key: string]: boolean }) {
        Object.keys(selectedPosition).forEach((position) => (selectedPosition[position] = false));
        this.letterHolderService.redrawTiles();
    }
}
