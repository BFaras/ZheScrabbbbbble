import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {  MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { Dictionary } from '@app/classes/dictionary';
import { GameSettings } from '@app/classes/game-settings';
import { MAX_VALUE_TIMER_MINUTE, MINIMAL_DOUBLE_DIGIT, ONE_MINUTE_VALUE, Timer, TIMER_MODIFICATION_VALUE } from '@app/classes/timer';
import { VirtualPlayerDifficulty } from '@app/classes/virtual-player-difficulty';
import { VirtualPlayerInfo } from '@app/classes/virtual-player-info';
import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { NameValidatorService } from '@app/services/name-validator-service/name-validator.service';
import { Settings, WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent implements OnInit, OnDestroy {
    @ViewChild('decrementButton') decrementButton: ElementRef;
    @ViewChild('incrementButton') incrementButton: ElementRef;
    @ViewChild('time') time: ElementRef;
    timer: Timer;
    nameValidatorService: NameValidatorService;
    message: string;
    isSoloMode: boolean;
    isMultiMode: boolean;
    buttonDisabled: boolean;
    virtualPlayerNameList: VirtualPlayerInfo[];
    filteredVirtualPlayerNameList: VirtualPlayerInfo[];
    selectedDifficulty: VirtualPlayerDifficulty;
    randomName: string;
    visibility: string = "Public";
    IsProtectedRoom:boolean = false;
    passwordRoom:string = "";
    dictionaryList: Dictionary[];
    subscriptionSettings: Subscription;
    subscriptionDictionary: Subscription;
    subscriptionNamesList: Subscription;
    subscriptionRoom: Subscription;
    subscriptionRoomNameAvailable:Subscription;

    constructor(
        private waitingRoomManagerService: WaitingRoomManagerService,
        private gameModeService: GameModeService,
        private router: Router,
        private dictionaryService: DictionaryService
    ) {
        this.timer = { minute: 1, second: 0 };
        this.dictionaryList = [];
        this.isSoloMode = this.gameModeService.isSoloMode;
        this.buttonDisabled = true;
    }

    ngOnDestroy(): void {
        this.subscriptionSettings.unsubscribe();
        this.subscriptionDictionary.unsubscribe();
        if (this.subscriptionNamesList) this.subscriptionNamesList.unsubscribe();
        if (this.subscriptionRoom) this.subscriptionRoom.unsubscribe();
    }

    ngOnInit() {
        this.subscriptionSettings = this.waitingRoomManagerService.getCurrentSettings().subscribe((settings) => this.updateSettings(settings));
        this.subscriptionDictionary = this.dictionaryService.getDictionaryList().subscribe((dicts) => this.updateDictionaries(dicts));
        this.subscriptionNamesList = this.gameModeService.getPlayerNameListObservable().subscribe((names) => this.updateVirtualPlayerNameList(names));
        this.subscriptionRoom = this.waitingRoomManagerService.getSoloRoomObservable().subscribe(async () => this.router.navigate(['/game']));
        this.gameModeService.getPlayerNameList();
    }

    getRadioButtonValue(event:MatRadioChange){
        this.visibility = event.value;
        this.verifyIsRoomProtected()

    }

    verifyIsRoomProtected(){
        if (this.visibility === "Protected"){
            this.IsProtectedRoom =true;
        }
        else{
            this.IsProtectedRoom = false;
        }
    }

    updateSettings(settings: Settings): void {
        this.time.nativeElement.innerHTML = settings.timer.minute.toString() + ':' + settings.timer.second.toString();
        (document.getElementById('player-name') as HTMLInputElement).value = settings.playerName;
    }

    updateDictionaries(dictionaryList: Dictionary[]): void {
        this.dictionaryList = [...dictionaryList];
        this.buttonDisabled = false;
    }

    updateVirtualPlayerNameList(virtualPlayerNameList: VirtualPlayerInfo[]): void {
        if (this.isSoloMode) {
            this.virtualPlayerNameList = virtualPlayerNameList;
            this.updateRandomName();
        }
    }

    updateRandomName(): void {
        this.selectedDifficulty = (document.getElementById('game-difficulty') as HTMLInputElement)?.value as VirtualPlayerDifficulty;
        this.filteredVirtualPlayerNameList = this.virtualPlayerNameList.filter((virtualPlayerName) => {
            return virtualPlayerName.difficulty === this.selectedDifficulty;
        });
        this.randomName = this.filteredVirtualPlayerNameList[Math.floor(Math.random() * this.filteredVirtualPlayerNameList.length)].name;
    }

    checkSoloInput(playerName: string): boolean {
        return playerName.trim() !== '';
    }

    checkVirtualPlayerName(playerName: string): boolean {
        let randomNameHasBeenModified = false;
        while (playerName.trim().toUpperCase() === this.randomName.trim().toUpperCase()) {
            this.updateRandomName();
            randomNameHasBeenModified = true;
        }
        if (randomNameHasBeenModified) {
            alert('Vous avez choisi le même nom que le joueur virtuel. Le nom du joueur virtuel a été modifié à ' + this.randomName + '.');
        }
        return true;
    }

    checkMultiInput(playerName: string): boolean {
        const roomName = (document.getElementById('room-name') as HTMLInputElement).value;
        return roomName.trim() !== '' && playerName.trim() !== '';
    }

    createSoloRoom(playerName: string): void {
        if (this.buttonDisabled) return;
        this.buttonDisabled = true;
        const easyMode = (document.getElementById('game-difficulty') as HTMLInputElement)?.value === VirtualPlayerDifficulty.BEGINNER;
        const dictionaryIndex = (document.getElementById('dictionaries') as HTMLSelectElement)?.selectedIndex;
        this.checkVirtualPlayerName(playerName);
        const gameSettings: GameSettings = {
            hostPlayerName: playerName,
            roomName: '',
            virtualPlayerName: this.randomName,
            isSoloMode: true,
            isEasyMode: easyMode,
            timer: this.timer,
            dictionary: this.dictionaryList[dictionaryIndex].title,
            gameType: this.gameModeService.scrabbleMode,
        };
        sessionStorage.clear();
        this.waitingRoomManagerService.createSoloRoom(gameSettings);
    }

    createMultiRoom(playerName: string): void {
        if (this.buttonDisabled) return;
        this.buttonDisabled = true;
        const roomNameValue = (document.getElementById('room-name') as HTMLInputElement).value;
        if (this.visibility === "Protected"){
            this.passwordRoom = (document.getElementById("password-room") as HTMLInputElement).value;
        }
        //const dictionaryIndex = (document.getElementById('dictionaries') as HTMLSelectElement)?.selectedIndex;
        this.waitingRoomManagerService.setRoomToJoin(roomNameValue);
        this.waitingRoomManagerService.setHostPlayer(true);
        this.waitingRoomManagerService.setMessageSource("Veuillez attendre qu'un joueur rejoigne votre salle.");
        /*const gameSettings: GameSettings = {
            hostPlayerName: playerName,
            roomName: roomNameValue,
            isSoloMode: false,
            timer: this.timer,
            dictionary: this.dictionaryList[dictionaryIndex].title,
            gameType: this.gameModeService.scrabbleMode,
        };*/
        sessionStorage.clear();
        //raison inconnu cela ne fontionne plus socket Room Creation
        /*this.subscriptionRoomNameAvailable = this.waitingRoomManagerService.verifyIfRoomNameAvailable()
        .subscribe((RoomNameCodeError)=>{
            console.log(RoomNameCodeError);
            if (RoomNameCodeError !== "0"){
                window.alert("Le nom de la salle est non valide");
            }else{
                window.alert("Le nom de la salle est valide"); 
            }
        })*/
        this.waitingRoomManagerService.createMultiRoom(roomNameValue,this.visibility,this.passwordRoom);
        this.router.navigate(['/waiting-room']);
    }

    alertFalseInput() {
        alert('Veuillez remplir les champs vides.');
    }

    incrementClock(): void {
        this.timer.second += TIMER_MODIFICATION_VALUE;
        if (this.timer.second / ONE_MINUTE_VALUE === 1) {
            this.timer.second = 0;
            this.timer.minute++;
            this.decrementButton.nativeElement.disabled = false;
        }

        if (this.timer.minute >= MAX_VALUE_TIMER_MINUTE) {
            this.incrementButton.nativeElement.disabled = true;
        }
        this.printTimer();
    }

    decrementClock(): void {
        this.timer.second -= TIMER_MODIFICATION_VALUE;
        if (this.timer.second === -TIMER_MODIFICATION_VALUE) {
            this.timer.second = TIMER_MODIFICATION_VALUE;
            this.timer.minute--;
            this.incrementButton.nativeElement.disabled = false;
        }

        if (this.timer.minute === 0 && this.timer.second <= TIMER_MODIFICATION_VALUE) {
            this.decrementButton.nativeElement.disabled = true;
        }
        this.printTimer();
    }

    printTimer(): void {
        this.time.nativeElement.innerHTML =
            this.timer.second < MINIMAL_DOUBLE_DIGIT
                ? this.timer.minute.toString() + ':0' + this.timer.second.toString()
                : this.timer.minute.toString() + ':' + this.timer.second.toString();
    }
}
