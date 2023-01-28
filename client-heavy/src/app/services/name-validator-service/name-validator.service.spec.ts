import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { NameValidatorService } from './name-validator.service';

describe('NameValidatorService', () => {
    let service: NameValidatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(NameValidatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validateGuestPlayerName should return true if string is equal to HostPlayerName', () => {
        service.validateGuestPlayerName('PlayerNameTest1', 'PlayerNameTest2');
        expect(service.guestPlayerNameIsValid).toBeTrue();
    });

    it('should return false if guestPlayer is an empty string', () => {
        service.validateGuestPlayerName('HostTest', '');
        expect(service.guestPlayerNameIsValid).toBeFalse();
    });

    it('return an observable when calling checkIfNameEqualsVirtualPlayer', () => {
        expect(service.checkIfNameEqualsVirtualPlayer('test') instanceof Observable).toBeTrue();
    });
});
