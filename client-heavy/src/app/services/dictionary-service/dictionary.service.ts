import { Injectable } from '@angular/core';
import { Dictionary } from '@app/classes/dictionary';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class DictionaryService {
    private socket: Socket;
    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
    }

    getDictionaryList(): Observable<Dictionary[]> {
        return new Observable((observer: Observer<Dictionary[]>) => {
            this.socket.emit('getDictionaryList');
            this.socket.on('dictionaryList', (dictionaries) => observer.next(dictionaries));
        });
    }
}
