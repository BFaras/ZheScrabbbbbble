/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Dictionary } from '@app/classes/dictionary';
import { CommunicationService } from './communication.service';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected message (HttpClient called once)', () => {
        const expectedMessage: Dictionary = { title: 'test', description: 'test' };
        service.getDictionary('test').subscribe((response: Dictionary) => {
            expect(response.title).toEqual(expectedMessage.title);
            expect(response.description).toEqual(expectedMessage.description);
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}api/dictionary/test`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedMessage);
    });

    it('should return added element when sending a POST request (HttpClient called once)', () => {
        const sentMessage: Dictionary = { title: 'Hello', description: 'World', words: ['helloworld'] };
        service.postDictionary(sentMessage).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}api/dictionary`);
        expect(req.request.method).toBe('POST');
        req.flush(sentMessage);
    });

    it('should handle http error with get', () => {
        service.getDictionary('test').subscribe((response: Dictionary) => {
            expect(response).toBeUndefined();
        }, fail);

        const req = httpMock.expectOne(`${baseUrl}api/dictionary/test`);
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Random error occurred'));
    });

    it('should handle http error with post', () => {
        const confirmSpy = spyOn(window, 'confirm');
        const sentMessage: Dictionary = { title: 'Hello', description: 'World', words: ['helloworld'] };
        service.postDictionary(sentMessage).subscribe(() => {}, fail);
        const req = httpMock.expectOne(`${baseUrl}api/dictionary`);
        expect(req.request.method).toBe('POST');
        req.error(new ErrorEvent('Error'));
        expect(confirmSpy).toHaveBeenCalled();
    });
});
