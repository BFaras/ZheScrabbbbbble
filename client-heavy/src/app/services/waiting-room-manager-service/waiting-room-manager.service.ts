import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer';
import { WaitingRoom } from '@app/classes/waiting-room';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';

export interface Settings {
    playerName: string;
    timer: Timer;
}

@Injectable({
    providedIn: 'root',
})
export class WaitingRoomManagerService {
    private playersInRoom: string[] = [];
    private socket: Socket;
    private messageSource: string;
    private alertMessage: string;
    private hostPlayer: boolean;
    private hostPlayerName: string;
    private guestPlayerConnected: boolean;
    private roomToJoin: string;
    private visibility: string;
    private idRoom: string;
    private waitingRoomObservable: Observable<WaitingRoom[]>;

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
        this.waitingRoomObservable = new Observable((observer: Observer<WaitingRoom[]>) => {
            this.socket.on('Game Room List Response', (rooms) => {
                observer.next(rooms)
            });
        });
    }
    /*modifier pour objet waiting room */
    setIdRoom(id: string) {
        this.idRoom = id;
    }
    /*modifier pour objet waiting room */
    getIdRoom() {
        this.idRoom;
    }
    /*modifier pour objet waiting room */
    setVisibility(visibility: string) {
        this.visibility = visibility;
    }
    /*modifier pour objet waiting room */
    getVisibility() {
        return this.visibility;
    }
    getGameRoomActive() {
        this.socket.emit('Get Game Room List');
    }

    getMessageSource(): string {
        return this.messageSource;
    }

    getAlertMessage(): string {
        return this.alertMessage;
    }

    getPlayersInRoom() {
        return this.playersInRoom;
    }

    setMessageSource(message: string) {
        this.messageSource = message;
    }

    setAlertMessage(message: string) {
        this.alertMessage = message;
    }

    setPlayersInRoom(players: string[]) {
        this.playersInRoom = players;
    }

    isHostPlayer(): boolean {
        return this.hostPlayer;
    }

    setHostPlayer(value: boolean) {
        this.hostPlayer = value;
    }

    setHostPlayerName(value: string) {
        this.hostPlayerName = value;
    }

    isGuestPlayer(): boolean {
        return this.guestPlayerConnected;
    }

    setGuestPlayer(value: boolean) {
        this.guestPlayerConnected = value;
    }

    getRoomToJoin(): string {
        return this.roomToJoin;
    }

    setRoomToJoin(room: string) {
        this.roomToJoin = room;
    }

    guestAnswered(answer: boolean, observer: Observer<boolean>) {
        console.log(answer)
        observer.next(answer);
    }

    guestPlayerIsWaiting(isWaiting: boolean, message: string, observer: Observer<string>) {
        this.guestPlayerConnected = isWaiting;
        observer.next(message);
    }

    getHostPlayerName(): string {
        return this.hostPlayerName;
    }

    joinRoom(password: string): void {
        this.socket.emit('Join Game Room', this.idRoom, password);
    }

    deleteRoom(): void {
        this.socket.emit('Leave Game Room');
    }

    getWaitingRoomObservable(): Observable<WaitingRoom[]> {
        return this.waitingRoomObservable;
    }

    createMultiRoom(roomName: string, visibility: string, passwordRoom: string) {
        this.socket.emit('Create Game Room', roomName, visibility, passwordRoom);
    }
    //raison inconnue cela ne marche plus
    createRoomResponse(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socket.once('Room Creation Response', (RoomNameCodeError) => observer.next(RoomNameCodeError));
        });
    }
    //cancel Join room 
    cancelJoinGameRoom() {
        this.socket.emit('Cancel Join Request');
    }
}
