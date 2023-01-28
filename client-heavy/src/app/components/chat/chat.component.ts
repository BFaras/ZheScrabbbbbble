import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
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

    messageHelp: Message = {
        username: '[SERVER]',
        body:
            'Voici les commandes possibles:\n!placer - Ajouter une ou plusieurs lettres sur la grille selon le format <ligne><colonne>[h|v] <' +
            'lettres>. (ex. !placer g9h adant)\n!passer - Passer votre tour.\n!échanger - Échanger un certain nombre de lettres. (ex. !échanger mwb)',
        color: '',
    };

    messageInvalidCommand: Message = {
        username: '[SERVER]',
        body: 'Entrée invalide.',
        color: '',
    };

    messageInvalidArgument: Message = {
        username: '[SERVER]',
        body: 'Erreur de syntaxe.',
        color: '',
    };

    messageHistory: Message[] = [];

    subscription: Subscription;

    constructor(private chatService: ChatService, private messageParserService: MessageParserService) {}

    ngOnInit() {
        const history = sessionStorage.getItem('chat');
        if (history) this.messageHistory = JSON.parse(history);
        this.subscription = this.chatService.getMessages().subscribe((message: Message) => this.updateMessageHistory(message));
    }

    updateMessageHistory(message: Message) {
        this.messageHistory.push(message);
        sessionStorage.setItem('chat', JSON.stringify(this.messageHistory));
    }

    sendMessage() {
        if (this.message.body.length >= LIMIT_OF_CHARACTERS) {
            this.chatService.sendMessage(this.messageInvalidArgument);
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
        this.subscription.unsubscribe();
    }

    private sendMessageByType(messageType: MessageType) {
        switch (messageType) {
            case MessageType.Empty:
                break;
            case MessageType.Normal:
                this.chatService.sendMessage(this.message);
                this.message.body = '';
                break;
            case MessageType.Place:
            case MessageType.Pass:
            case MessageType.Swap:
            case MessageType.Hint:
            case MessageType.Reserve: {
                const type: string = MessageType[messageType];
                this.chatService.sendMessage(this.message);
                this.message.body = this.message.body.substring(this.message.body.indexOf(' ') + 1, this.message.body.length);
                this.chatService.sendCommand(this.message.body, type);
                this.message.body = '';
                break;
            }
            case MessageType.InvalidCommand:
                this.chatService.sendMessage(this.message);
                this.chatService.sendMessage(this.messageInvalidCommand);
                this.message.body = '';
                break;
            case MessageType.InvalidArgument:
                this.chatService.sendMessage(this.message);
                this.chatService.sendMessage(this.messageInvalidArgument);
                this.message.body = '';
                break;
            case MessageType.Help:
                this.chatService.sendMessage(this.messageHelp);
                this.message.body = '';
                break;
        }
    }
}
