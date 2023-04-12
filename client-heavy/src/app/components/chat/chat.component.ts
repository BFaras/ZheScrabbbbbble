import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { ChatMessage } from '@app/classes/chat-info';
import { Message } from '@app/classes/message';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { MessageParserService } from '@app/services/message-parser-service/message-parser.service';
import { ThemesService } from '@app/services/themes-service/themes-service';
import { Subscription } from 'rxjs';

const LIMIT_OF_CHARACTERS = 512;

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})

export class ChatComponent implements OnDestroy {
    @Output() receiver = new EventEmitter();
    switch = false;

    message: Message = {
        username: '',
        body: '',
        color: '',
    };

    messageHistory: ChatMessage[] = [];

    subscriptionMessage: Subscription;
    subscriptionHistoryMessage: Subscription;

    constructor(private chatService: ChatService, private messageParserService: MessageParserService, private accountService: AccountService, private themeService: ThemesService) {

        this.subscriptionHistoryMessage = this.chatService.getChatHistory(this.chatService.getChatInGameRoom()).subscribe((chatHistory: ChatMessage[]) => {
            chatHistory.forEach((chatMessage) => {
                this.updateMessageHistory(chatMessage)
            })
        });
        this.subscriptionMessage = this.chatService.getMessagesInGame().subscribe((response: { chatCode: string, message: ChatMessage }) => {
            if (response.chatCode === this.chatService.getChatInGameRoom()) this.updateMessageHistory(response.message);
        });
    }


    updateMessageHistory(chatMessage: ChatMessage) {
        this.messageHistory.push(chatMessage);
        sessionStorage.setItem('chat', JSON.stringify(this.messageHistory));
    }

    openPopupChat() {
        if ((window as any).openChat) {
            (window as any).openChat(this.accountService.getFullAccountInfo(), this.themeService.getActiveTheme(), this.accountService.getLanguage());
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
    }

    ngOnDestroy() {
        this.subscriptionMessage.unsubscribe();
    }
}
