

export const VICTORY_STATUS = 0;
export const DEFEAT_STATUS = 1;
export const DEFEAT = "Défaite";
export const VICTORY = "Victoire";
export interface ActionHistory {
    date: string;
    time: string;
    status: number;

}
