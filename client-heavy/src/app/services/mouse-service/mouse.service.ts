import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { TILES } from '@app/constants/letters-constants';
import { ManipulationRackService } from '@app/services/manipulation-rack-service/manipulation-rack.service';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    mousePosition: Vec2 = { x: 0, y: 0 };

    constructor(private manipulationRack: ManipulationRackService) {}

    selectRack(coordinate: Vec2) {
        this.mousePosition = coordinate;
        if (this.getPositionTile()) {
            this.manipulationRack.selectLetterOnRack(this.getPositionTile());
        }
    }

    manipulateRackOnClick(coordinate: Vec2): number {
        this.mousePosition = coordinate;
        const positionTile = this.getPositionTile();
        this.manipulationRack.manipulateLetterOnRack(positionTile);
        return positionTile;
    }

    getPositionTile(): number {
        return Number(Object.keys(TILES).find((key) => TILES[key][0] <= this.mousePosition.x && this.mousePosition.x < TILES[key][1]));
    }
}
