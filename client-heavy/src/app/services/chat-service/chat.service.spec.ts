/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return client id when calling getClientId', () => {
        const socketId = service['socket'].id;
        expect(service.getClientID()).toEqual(socketId);
    });

    it('should call socket emit when sendMessage is called', () => {
        const message = { username: 'Joe', body: 'test' };
        const sendMessageSpy = spyOn(service['socket'], 'emit');
        service.sendMessage(message);
        expect(sendMessageSpy).toHaveBeenCalledWith('new-message', message);
    });

    it('should call socket emit when sendCommand is called', () => {
        const sendMessageSpy = spyOn(service['socket'], 'emit');
        service.sendCommand('test', 'test');
        expect(sendMessageSpy).toHaveBeenCalledWith('command', 'test', 'test');
    });
});
