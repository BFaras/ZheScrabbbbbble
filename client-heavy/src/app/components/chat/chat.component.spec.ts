/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MessageType } from '@app/services/message-parser-service/message-parser.service';
import { of } from 'rxjs';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule],
            declarations: [ChatComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call sendMessage on button click', () => {
        spyOn(component, 'sendMessage');
        const button = fixture.debugElement.query(By.css('button'));
        button.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(component.sendMessage).toHaveBeenCalled();
    });

    it('should call sendMessage on Enter key press', () => {
        spyOn(component, 'sendMessage');
        const input = fixture.debugElement.query(By.css('input'));
        input.triggerEventHandler('keyup.enter', {});
        fixture.detectChanges();
        expect(component.sendMessage).toHaveBeenCalled();
    });

    it('should unsubscribe when destroyed', () => {
        component.subscription = of(true).subscribe();
        component.ngOnDestroy();
        expect(component.subscription.closed).toBeTruthy();
    });
    it('should not call anything when sending empty message   ', () => {
        const sdMs = spyOn(component['chatService'], 'sendMessage');
        const sdCm = spyOn(component['chatService'], 'sendCommand');
        component.sendMessage();
        expect(sdMs).toHaveBeenCalledTimes(0);
        expect(sdCm).toHaveBeenCalledTimes(0);
    });
    it('should send the invalidArgument message when a message is longer than 512 characters', () => {
        const sdMs = spyOn(component['chatService'], 'sendMessage');
        component.message = {
            username: '',
            body:
                'BCMRBaluMaNujbqzBu4JQYaVLCSISAbNTxKEBCz2i90KTqqfIUg1SNJwaOMKgwx928Nbd5aJadU8vqVXgk1YhYT49Lu2SuIacYUyJak2z' +
                'fFkGGBhuuVIUM5DPuKZjZ1LKyepRSuWjRabFrglFnoEa3LH7kmoArYswSkAaNCs2GLD73JXAnjSA0ebMcNvJgmNAWu51hDeSvFUtXYHO' +
                'DZOkK16dtEXEEa9MZT13JLZKncdT49uta7QxYCtbjsBVenDv' +
                'M9QY0OtLvT1oxaBeZxznmYudI8KK1dGJ5ftAF0NpRC4KNY3wB2o6ScYjzCVxcTFfl6okQLLqNSC0och7uMR9lFB6zSlY4wB3' +
                'ieWKyqxpAsSQrm2kwmJseDnmo3avVP0nK1IMexBfxis0GIkrlxzYDQfQtXx8R5HLcoPJUhaY8KnO2Y2ZccNDOQu6NYlbzhcUdUnrElmXtJ' +
                '9QtcKHOlPJj9RAv4lGoVpvF4ECNwDjkHnva36ZVA71YIF5gHmKHnuEWXT3iC2',
            color: '',
        };

        component.sendMessage();
        expect(sdMs).toHaveBeenCalledWith(component.messageInvalidArgument);
    });
    it('should send the content of the input when sendMessageByType is called with a normal message  ', () => {
        const sdMs = spyOn(component['chatService'], 'sendMessage');
        component['sendMessageByType'](MessageType.Normal);
        expect(sdMs).toHaveBeenCalledWith(component.message);
    });
    it('should send the help message when sendMessageByType is called with a message of the help type ', () => {
        const sdMs = spyOn(component['chatService'], 'sendMessage');
        component['sendMessageByType'](MessageType.Help);
        expect(sdMs).toHaveBeenCalledWith(component.messageHelp);
    });
    it('should send the invalidArgument message when sendMessageByType is called with a message of the invalidArgument type ', () => {
        const sdMs = spyOn(component['chatService'], 'sendMessage');
        component['sendMessageByType'](MessageType.InvalidArgument);
        expect(sdMs).toHaveBeenCalledWith(component.messageInvalidArgument);
    });
    it('should send the invalidCommand message when sendMessageByType is called with a message of the invalidCommand type ', () => {
        const sdMs = spyOn(component['chatService'], 'sendMessage');
        component['sendMessageByType'](MessageType.InvalidCommand);
        expect(sdMs).toHaveBeenCalledWith(component.messageInvalidCommand);
    });
    it('should send the message with the string Pass when sendMessageByType is called with a message of the Pass type ', () => {
        const sdCm = spyOn(component['chatService'], 'sendCommand');
        component['sendMessageByType'](MessageType.Pass);
        expect(sdCm).toHaveBeenCalledWith(component.message.body, 'Pass');
    });
    it('should send the message with the string Place when sendMessageByType is called with a message of the Place type ', () => {
        const sdCm = spyOn(component['chatService'], 'sendCommand');
        component['sendMessageByType'](MessageType.Place);
        expect(sdCm).toHaveBeenCalledWith(component.message.body, 'Place');
    });
    it('should send the message with the string Swap when sendMessageByType is called with a message of the Swap type ', () => {
        const sdCm = spyOn(component['chatService'], 'sendCommand');
        component['sendMessageByType'](MessageType.Swap);
        expect(sdCm).toHaveBeenCalledWith(component.message.body, 'Swap');
    });
    it('should send the message with the string Reserve when sendMessageByType is called with a message of the Reserve type ', () => {
        const sdCm = spyOn(component['chatService'], 'sendCommand');
        component['sendMessageByType'](MessageType.Reserve);
        expect(sdCm).toHaveBeenCalledWith(component.message.body, 'Reserve');
    });
    it('should send the message with the string Hint when sendMessageByType is called with a message of the Hint type ', () => {
        const sdCm = spyOn(component['chatService'], 'sendCommand');
        component['sendMessageByType'](MessageType.Hint);
        expect(sdCm).toHaveBeenCalledWith(component.message.body, 'Hint');
    });
    it('should add message to session storage when calling updateMessageHistory', () => {
        const sessionStorageSpy = spyOn(sessionStorage, 'setItem');
        const message = { username: 'test', body: 'test' };
        component.updateMessageHistory(message);
        expect(sessionStorageSpy).toHaveBeenCalledWith('chat', JSON.stringify([message]));
    });

    it('should switch variable to true if chatbox becomes receiver', () => {
        spyOn(component.receiver, 'emit');
        component.isReceiver();
        expect(component.receiver.emit).toHaveBeenCalledWith('chatbox' + component.switch);
        expect(component.switch).toBeTruthy();
    });
});
