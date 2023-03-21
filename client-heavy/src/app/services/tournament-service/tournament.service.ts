import { Injectable } from "@angular/core";
import { SocketManagerService } from "../socket-manager-service/socket-manager.service";

@Injectable({
    providedIn: 'root',
})
export class TournamentService {
    constructor(private socketManager: SocketManagerService){}
}