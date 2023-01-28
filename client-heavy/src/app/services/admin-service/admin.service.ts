import { Injectable } from '@angular/core';
import { Dictionary } from '@app/classes/dictionary';
import { Game } from '@app/classes/game';
import { VirtualPlayerDifficulty } from '@app/classes/virtual-player-difficulty';
import { VirtualPlayerInfo } from '@app/classes/virtual-player-info';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

export enum DatabaseType {
    SCORE = 'scoreboard',
    DICTIONARY = 'dictionary',
    NAMES = 'playerNames',
    GAMES = 'gameHistory',
}

const DICTIONARY_INTERFACE_LENGTH = 3;

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private socket: Socket;

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
    }

    getErrorObservable(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socket.on('adminError', (error: string) => observer.next(error));
        });
    }

    getVirtualPlayerNames() {
        this.socket.emit('getVirtualPlayerNames');
    }

    getVirtualPlayerNamesObservable(): Observable<VirtualPlayerInfo[]> {
        return new Observable((observer: Observer<VirtualPlayerInfo[]>) => {
            this.socket.on('virtualPlayerNames', (names: VirtualPlayerInfo[]) => observer.next(names));
        });
    }

    addVirtualPlayer(name: string, difficulty: string) {
        const virtualPlayerInfo: VirtualPlayerInfo = {
            name,
            difficulty: difficulty as VirtualPlayerDifficulty,
            default: false,
        };
        this.socket.emit('addVirtualPlayerNames', virtualPlayerInfo);
    }

    deleteVirtualPlayer(name: string) {
        this.socket.emit('deleteVirtualPlayerNames', name);
    }

    editVirtualPlayer(oldName: string, newName: string, difficulty: string) {
        this.socket.emit('editVirtualPlayerNames', oldName, { name: newName, difficulty: difficulty as VirtualPlayerDifficulty, default: false });
    }

    getGameHistory() {
        this.socket.emit('getGameHistoryList');
    }

    getGameHistoryObservable(): Observable<Game[]> {
        return new Observable((observer: Observer<Game[]>) => {
            this.socket.on('historyList', (names: Game[]) => observer.next(names));
        });
    }

    getDictionaries() {
        this.socket.emit('getDictionaryList');
    }

    getDictionariesObservable(): Observable<Dictionary[]> {
        return new Observable((observer: Observer<Dictionary[]>) => {
            this.socket.on('dictionaryList', (names: Dictionary[]) => observer.next(names));
        });
    }

    deleteDictionary(title: string) {
        this.socket.emit('deleteDictionary', title);
    }

    editDictionary(oldTitle: string, newTitle: string, newDescription: string) {
        this.socket.emit('editDictionary', oldTitle, { title: newTitle, description: newDescription });
    }

    resetDatabase() {
        this.socket.emit('resetDatabase');
    }

    resetDatabaseType(type: DatabaseType) {
        this.socket.emit('resetCollection', type);
    }

    checkIfValidDict(dict: Dictionary): boolean {
        return (
            typeof dict.title === 'string' &&
            typeof dict.description === 'string' &&
            Array.isArray(dict.words) &&
            typeof dict.words[0] === 'string' &&
            Object.keys(dict).length === DICTIONARY_INTERFACE_LENGTH
        );
    }
}
