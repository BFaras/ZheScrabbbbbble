/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { Dictionary } from '@app/classes/dictionary';
import { VirtualPlayerDifficulty } from '@app/classes/virtual-player-difficulty';
import { AdminService } from './admin.service';

describe('AdminService', () => {
    let service: AdminService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AdminService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit addVirtualPlayerNames when calling addVirtualPlayer', () => {
        const addVirtualPlayerSpy = spyOn(service['socket'], 'emit');
        service.addVirtualPlayer('test', VirtualPlayerDifficulty.BEGINNER);
        expect(addVirtualPlayerSpy).toHaveBeenCalledWith('addVirtualPlayerNames', {
            name: 'test',
            difficulty: VirtualPlayerDifficulty.BEGINNER,
            default: false,
        });
    });

    it('should emit editVirtualPlayerNames when calling editVirtualPlayerNames', () => {
        const editVirtualPlayerSpy = spyOn(service['socket'], 'emit');
        service.editVirtualPlayer('test1', 'test2', VirtualPlayerDifficulty.BEGINNER);
        expect(editVirtualPlayerSpy).toHaveBeenCalledWith('editVirtualPlayerNames', 'test1', {
            name: 'test2',
            difficulty: VirtualPlayerDifficulty.BEGINNER,
            default: false,
        });
    });

    it('should emit editDictionary when calling editDictionary', () => {
        const editDictionarySpy = spyOn(service['socket'], 'emit');
        service.editDictionary('test1', 'test2', 'desc');
        expect(editDictionarySpy).toHaveBeenCalledWith('editDictionary', 'test1', {
            title: 'test2',
            description: 'desc',
        });
    });

    it('should retrun true if dict is valid when calling check if valid dict', () => {
        expect(service.checkIfValidDict({ title: 'test', description: 'test', words: ['test'] } as Dictionary)).toBeTrue();
    });

    it('should retrun true if dict is valid when calling check if valid dict', () => {
        expect(service.checkIfValidDict({ title: 'test', description: 'test', words: ['test'], invalidParameter: 'test' } as Dictionary)).toBeFalse();
    });
});
