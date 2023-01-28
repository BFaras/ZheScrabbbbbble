import { Dictionary } from './dictionary';
import { VirtualPlayerInputs } from './virtual-player-inputs';

export interface DataType {
    dict: Dictionary;
    virtualPlayer: VirtualPlayerInputs;
    formType: string;
}
