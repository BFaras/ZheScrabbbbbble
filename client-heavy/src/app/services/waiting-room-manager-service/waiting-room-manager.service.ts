import { Injectable } from '@angular/core';
import { GameSettings } from '@app/classes/game-settings';
import { Timer } from '@app/classes/timer';
import { WaitingRoom } from '@app/classes/waiting-room';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
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
    private socket: Socket;
    private messageSource: string;
    private alertMessage: string;
    private hostPlayer: boolean;
    private hostPlayerName: string;
    private guestPlayerConnected: boolean;
    private roomToJoin: string;
    private visibility: string;
    private idRoom:string;
    private waitingRoomObservable: Observable<WaitingRoom[]>;

    constructor(private socketManagerService: SocketManagerService, private gameModeService: GameModeService) {
        this.socket = this.socketManagerService.getSocket();
        this.waitingRoomObservable = new Observable((observer: Observer<WaitingRoom[]>) => {
            this.socket.on('Game Room List Response', (rooms) => {
                observer.next(rooms)});
        });
    }
    /*modifier pour objet waiting room */
    setIdRoom(id:string){
        this.idRoom = id;
    }
    /*modifier pour objet waiting room */
    getIdRoom(){
        this.idRoom;
    }
    /*modifier pour objet waiting room */
    setVisibility(visibility:string){
    this.visibility = visibility;
    }
    /*modifier pour objet waiting room */
    getVisibility(){
        return this.visibility ;
    }
    getGameRoomActive(){
        this.socket.emit('Get Game Room List');
    }

    getMessageSource(): string {
        return this.messageSource;
    }

    getAlertMessage(): string {
        return this.alertMessage;
    }

    setMessageSource(message: string) {
        this.messageSource = message;
    }

    setAlertMessage(message: string) {
        this.alertMessage = message;
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

    getJoinedPlayer(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socket.on('guestPlayerIsWaiting', (message: string, isWaiting: boolean) => this.guestPlayerIsWaiting(isWaiting, message, observer));
        });
    }

    getJoinResponse(): Observable<boolean> {
        return new Observable((observer: Observer<boolean>) => {
            this.socket.on('guestAnswered', (answer: boolean) => this.guestAnswered(answer,observer));
        });
    }

    guestAnswered(answer: boolean, observer: Observer<boolean>) {
        /*this.alertMessage = message;*/
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

    joinRoom(password:string): void {
        this.socket.emit('Join Game Room', this.idRoom, password);
    }

    answerGuestPlayer(answer: boolean): void {
        console.log(this.idRoom)
        this.socket.emit('answerGuestPlayer', this.idRoom, answer);
    }

    deleteRoom(): void {
        this.socket.emit('Leave Game Room');
    }

    updateWaitingRoom(message: string): void {
        this.socket.emit('guestPlayerLeft', this.roomToJoin, message);
    }

    getGuestPlayerLeft(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socket.on('guestLeft', (message: string) => observer.next(message));
        });
    }

    getWaitingRoomObservable(): Observable<WaitingRoom[]> {
        return this.waitingRoomObservable;
    }

    convertMultiToSolo() {
        this.gameModeService.setGameMode(true);
        this.socket.emit('sendCurrentSettings');
    }

    getCurrentSettings(): Observable<Settings> {
        return new Observable((observer: Observer<Settings>) => {
            this.socket.on('hereAreTheSettings', (playerName: string, timer: Timer) => observer.next({ playerName, timer }));
        });
    }

    getSoloRoomObservable() {
        return new Observable((observer: Observer<boolean>) => {
            this.socket.on('soloRoomIsReady', (accepted) => observer.next(accepted));
        });
    }

    createSoloRoom(gameSettings: GameSettings) {
        this.socket.emit('createSoloRoom', gameSettings);
    }

    createMultiRoom(roomName: string,visibility:string,passwordRoom:string) {
        this.socket.emit('Create Game Room', roomName,visibility,passwordRoom);
    }
    //raison inconnue cela ne marche plus
    verifyIfRoomNameAvailable(){
        return new Observable((observer: Observer<string>) => {
            this.socket.on('Room Creation Response', (RoomNameCodeError) => observer.next(RoomNameCodeError));
        });
    }
    //cacncel Join room 
    cancelJoinGameRoom(){
        this.socket.emit('Cancel Join Request');
    }


}
