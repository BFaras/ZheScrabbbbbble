import { TestBed } from '@angular/core/testing';
import { Message } from '@app/classes/message';
import { MessageParserService, MessageType } from './message-parser.service';

describe('MessageParserService', () => {
    let service: MessageParserService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MessageParserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should find a non-empty string to be not empty', () => {
        const message: Message = {
            username: '[TEST]',
            body: 'asd',
            color: '',
        };
        expect(service.isEmpty(message)).toEqual(false);
    });
    it('should find a empty string to be empty', () => {
        const message: Message = {
            username: '[TEST]',
            body: '',
            color: '',
        };
        expect(service.isEmpty(message)).toEqual(true);
    });
    it('should find a blank string to be empty', () => {
        const message: Message = {
            username: '[TEST]',
            body: '     ',
            color: '',
        };
        expect(service.isEmpty(message)).toEqual(true);
    });
    it('should find a normal message to not be a command', () => {
        const message: Message = {
            username: '[TEST]',
            body: 'asd',
            color: '',
        };
        expect(service.isCommand(message)).toEqual(false);
    });
    it('should find a command to be a command', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!asd',
            color: '',
        };
        expect(service.isCommand(message)).toEqual(true);
    });
    it('should find the command !passer to mean pass', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!passer',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.Pass);
    });
    it('should return an invalid argument error when an argument is given with !passer', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!passer jhfsjkh',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.InvalidArgument);
    });
    it('should find the command !échanger to mean swap', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!échanger jbjkf',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.Swap);
    });
    it('should return an invalid argument error when no argument is given with !échanger', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!échanger',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.InvalidArgument);
    });
    it('should find the command !placer to mean place', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!placer sdf sdf',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.Place);
    });
    it('should return an invalid argument error when no argument is given with !placer', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!placer',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.InvalidArgument);
    });
    it('should return an invalid command error when an unknown command is given', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!sdf',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.InvalidCommand);
    });
    it('should find a empty string to be empty message', () => {
        const message: Message = {
            username: '[TEST]',
            body: '',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.Empty);
    });
    it('should find a string without ! to be a normal message', () => {
        const message: Message = {
            username: '[TEST]',
            body: 'sfdhb',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.Normal);
    });
    it('should find the command !réserve to mean reserve', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!réserve',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.Reserve);
    });
    it('should return an invalid argument error when an argument is given with !réserve', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!réserve daf',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.InvalidArgument);
    });
    it('should find the command !indice to mean hint', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!indice',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.Hint);
    });
    it('should return an invalid argument error when an argument is given with !indice', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!indice daf',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.InvalidArgument);
    });
    it('should find the command !aide to mean help', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!aide',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.Help);
    });
    it('should return an invalid argument error when an argument is given with !aide', () => {
        const message: Message = {
            username: '[TEST]',
            body: '!aide daf',
            color: '',
        };
        expect(service.parseCommand(message)).toEqual(MessageType.InvalidArgument);
    });
});
