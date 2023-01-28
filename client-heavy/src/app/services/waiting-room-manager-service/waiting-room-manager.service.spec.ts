/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { Observer } from 'rxjs';
import { WaitingRoomManagerService } from './waiting-room-manager.service';

describe('WaitingRoomManagerService', () => {
    let service: WaitingRoomManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WaitingRoomManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setAlertMessage should modify alertMessage', () => {
        service.setAlertMessage('Test Message');
        expect(service.getAlertMessage()).toEqual('Test Message');
    });

    it('setGuestPlayer should modify guestPlayer', () => {
        service.setGuestPlayer(true);
        expect(service.isGuestPlayer()).toEqual(true);
    });

    it('should call socket emit when joinRoom is called', () => {
        const sendMessageSpy = spyOn(service['socket'], 'emit');
        service['roomToJoin'] = 'testRoom';
        service.joinRoom('Joe');
        expect(sendMessageSpy).toHaveBeenCalledWith('joinRoom', 'Joe', 'testRoom');
    });

    it('should call socket emit when answerGuestPlayer is called', () => {
        const sendMessageSpy = spyOn(service['socket'], 'emit');
        service['roomToJoin'] = 'testRoom';
        service.answerGuestPlayer(true, 'test');
        expect(sendMessageSpy).toHaveBeenCalledWith('answerGuestPlayer', 'testRoom', true, 'test');
    });

    it('should call socket emit when convertMultiToSolo is called', () => {
        const sendMessageSpy = spyOn(service['socket'], 'emit');
        service.convertMultiToSolo();
        expect(sendMessageSpy).toHaveBeenCalledWith('sendCurrentSettings');
    });

    it('should call observer next when calling guestAnswered', () => {
        const observer = { next: (value: boolean) => {} };
        const nextSpy = spyOn(observer, 'next');
        service.guestAnswered(true, 'test', observer as Observer<boolean>);
        expect(nextSpy).toHaveBeenCalledWith(true);
    });

    it('should call observer next when calling guestPlayerIsWaiting', () => {
        const observer = { next: (value: string) => {} };
        const nextSpy = spyOn(observer, 'next');
        service.guestPlayerIsWaiting(true, 'test', observer as Observer<string>);
        expect(nextSpy).toHaveBeenCalledWith('test');
    });
});
