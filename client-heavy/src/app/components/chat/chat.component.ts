import { AfterViewChecked, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { ChatMessage } from '@app/classes/chat-info';
import { Message } from '@app/classes/message';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { MessageParserService } from '@app/services/message-parser-service/message-parser.service';
import { ThemesService } from '@app/services/themes-service/themes-service';
import { Subscription } from 'rxjs';

const LIMIT_OF_CHARACTERS = 512;

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})

export class ChatComponent implements OnDestroy, AfterViewChecked {
    @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef;
    @Output() receiver = new EventEmitter();
    switch = false;
    updateScrollStatus = false;
    message: Message = {
        username: '',
        body: '',
        color: '',
    };

    messageHistory: ChatMessage[] = [];

    subscriptionMessage: Subscription;
    subscriptionHistoryMessage: Subscription;

    constructor(private chatService: ChatService,
        private messageParserService: MessageParserService, private accountService: AccountService,
        private themeService: ThemesService, private letterAdderService: LetterAdderService) {

        this.subscriptionHistoryMessage = this.chatService.getChatHistory(this.chatService.getChatInGameRoom()).subscribe((chatHistory: ChatMessage[]) => {
            chatHistory.forEach((chatMessage) => {
                this.updateMessageHistory(chatMessage)
            })
        });
        this.subscriptionMessage = this.chatService.getMessagesInGame().subscribe((response: { chatCode: string, message: ChatMessage }) => {
            if (response.chatCode === this.chatService.getChatInGameRoom()) this.updateMessageHistory(response.message);
        });
    }

    public scrollBottom() {
        this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;

    }
    updateMessageHistory(chatMessage: ChatMessage) {
        this.messageHistory.push(chatMessage);
        this.updateScrollStatus = true
    }

    openPopupChat() {
        if ((window as any).openChat) {
            (window as any).openChat(this.accountService.getFullAccountInfo(), this.themeService.getActiveTheme(), this.accountService.getLanguage());
        }
    }
    ngAfterViewChecked() {
        if (this.updateScrollStatus === true) {
            this.scrollBottom()
            this.updateScrollStatus = false
        }
    }

    sendMessage() {
        if (this.message.body.length >= LIMIT_OF_CHARACTERS) {
            //this.chatService.sendMessage(this.messageInvalidArgument);
            this.message.body = '';
            return;
        }
        if (this.messageParserService.isEmpty(this.message)) return;
        const gameRooomId = this.chatService.getChatInGameRoom();
        if (gameRooomId) this.chatService.sendMessage(this.message.body, gameRooomId);
        this.message.body = '';
    }

    isReceiver() {
        this.switch = !this.switch;
        this.receiver.emit('chatbox' + this.switch);
        this.letterAdderService.getLetterNotAcceptedObservable().next(true);
        this.letterAdderService.letterAdderMode = "";
    }

    ngOnDestroy() {
        this.subscriptionMessage.unsubscribe();
    }
}
