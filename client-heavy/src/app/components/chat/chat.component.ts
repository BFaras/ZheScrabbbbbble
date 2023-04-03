import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ChatMessage } from '@app/classes/chat-info';
import { Message } from '@app/classes/message';
import { ChatService } from '@app/services/chat-service/chat.service';
import { MessageParserService, MessageType } from '@app/services/message-parser-service/message-parser.service';
import { Subscription } from 'rxjs';

const LIMIT_OF_CHARACTERS = 512;

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})

export class ChatComponent implements OnInit, OnDestroy {
    @Output() receiver = new EventEmitter();
    switch = false;

    message: Message = {
        username: '',
        body: '',
        color: '',
    };
    gameRoomName: string;

    messageHistory: ChatMessage[] = [];

    subscriptionMessage: Subscription;
    subscriptionChatRoom: Subscription;

    constructor(private chatService: ChatService, private messageParserService: MessageParserService) {
        this.gameRoomName = this.chatService.getChatInGameRoom();
        console.log(this.gameRoomName);
        this.subscriptionMessage = this.chatService.getMessagesInGame().subscribe((response: { chatCode: string, message: ChatMessage }) => {
            this.updateMessageHistory(response.message)
        });
    }

    ngOnInit() {
    }

    updateMessageHistory(chatMessage: ChatMessage) {
        this.messageHistory.push(chatMessage);
        sessionStorage.setItem('chat', JSON.stringify(this.messageHistory));
    }


    sendMessage() {
        if (this.message.body.length >= LIMIT_OF_CHARACTERS) {
            //this.chatService.sendMessage(this.messageInvalidArgument);
            this.message.body = '';
            return;
        }
        const messageType: MessageType = this.messageParserService.parseCommand(this.message);
        this.sendMessageByType(messageType);
    }
    isReceiver() {
        this.switch = !this.switch;
        this.receiver.emit('chatbox' + this.switch);
    }

    ngOnDestroy() {
        this.subscriptionMessage.unsubscribe();
    }

    private sendMessageByType(messageType: MessageType) {
        switch (messageType) {
            case MessageType.Empty:
                break;
            case MessageType.Normal:
                this.chatService.sendMessage(this.message.body, this.gameRoomName);
                this.message.body = '';
                break;
        }
    }

    goToLink() {
        window.open('/profile-page', "_blank");
    }
}
