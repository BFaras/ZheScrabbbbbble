import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChatInfo, ChatMessage, ChatType } from '@app/classes/chat-info';
import { AccountService } from '@app/services/account-service/account.service';
//import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { Subscription } from 'rxjs';
//import { chat, chatlist } from './chats';

@Component({
    selector: 'app-chat-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements AfterContentChecked, OnInit {
    chatText: string = '';
    nextMessage: string = '';
    chatList: ChatInfo[];
    chatLog: Map<string, ChatMessage[]> = new Map<string, ChatMessage[]>();
    public: ChatType = ChatType.PUBLIC;
    private: ChatType = ChatType.PRIVATE;
    global: ChatType = ChatType.GLOBAL;
    visibility: ChatType;
    selectedChat: string;
    subscriptions: Subscription[] = [];
    username: string;

    constructor(private changeDetector: ChangeDetectorRef, private chatService: ChatService, private account: AccountService) {
        this.username = this.account.getUsername();
    }

    ngOnInit() {
        this.subscriptions.push(this.chatService.getChatsList().subscribe((chatList: ChatInfo[]) => {
            this.chatList = chatList;
            this.chatLog = this.chatService.messageLog;
        }));
        this.subscriptions.push(this.chatService.getNewMessages().subscribe((messageLog: Map<string, ChatMessage[]>) => {
            this.chatLog = messageLog;
        }));
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) subscription.unsubscribe();
    }

    sendMessage() {
        this.nextMessage = this.nextMessage.trim();
        if (this.nextMessage.length == 0) return;
        this.chatService.sendMessage(this.nextMessage, this.selectedChat);
        this.nextMessage = '';
    }

    updateScroll(scroll: number): number {
        return scroll;
    }

    setVisibility(event: Event, newVisibility: ChatType) {
        this.visibility = newVisibility;

        let chatLinks;

        chatLinks = document.getElementsByClassName("tabs");
        for (let i = 0; i < chatLinks.length; i++) {
            chatLinks[i].className = chatLinks[i].className.replace(" active", "");
        }

        (event.currentTarget! as HTMLTextAreaElement).className += " active";
    }

    selectChat(event: Event, id: string) {
        this.selectedChat = id;
        let chatButtons;
        chatButtons = document.getElementsByClassName("chat-button");
        for (let i = 0; i < chatButtons.length; i++) {
            chatButtons[i].className = chatButtons[i].className.replace(" selected", "");
        }
        (event.currentTarget! as HTMLTextAreaElement).className += " selected";
    }
}
