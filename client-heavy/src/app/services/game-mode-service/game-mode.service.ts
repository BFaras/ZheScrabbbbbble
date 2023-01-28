import { Injectable } from '@angular/core';
import { GameType } from '@app/classes/game-settings';
import { VirtualPlayerInfo } from '@app/classes/virtual-player-info';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class GameModeService {
    isSoloMode: boolean;
    scrabbleMode: GameType;
    private socket: Socket;

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
    }

    setGameMode(isSoloMode: boolean): void {
        this.isSoloMode = isSoloMode;
    }

    setScrabbleMode(scrabbleMode: GameType): void {
        this.scrabbleMode = scrabbleMode;
    }

    getPlayerNameList() {
        this.socket.emit('getVirtualPlayerNames');
    }

    getPlayerNameListObservable(): Observable<VirtualPlayerInfo[]> {
        return new Observable((observer: Observer<VirtualPlayerInfo[]>) => {
            this.socket.on('virtualPlayerNames', (names) => observer.next(names));
        });
    }
}
