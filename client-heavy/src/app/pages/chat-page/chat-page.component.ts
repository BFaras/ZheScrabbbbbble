import { AfterContentChecked, ChangeDetectorRef, Component } from '@angular/core';
import { ChatType } from '@app/components/chat/chat-info';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { chat, chatlist } from './chats';

@Component({
    selector: 'app-chat-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements AfterContentChecked {
    chatText: string = '';
    nextMessage: string = '';
    chatList: chat[] = chatlist;
    public: ChatType = ChatType.PUBLIC;
    private: ChatType = ChatType.PRIVATE;
    visibility: ChatType;

    constructor(private changeDetector: ChangeDetectorRef, private chatService: ChatService, private account: AccountService) {
        chatService.getNewMessages().subscribe((message: string) => {
            this.chatText += message + '\n';
        })
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }


    sendMessage() {
        const timeStamp = (new Date()).toLocaleTimeString().split(' ')[0];
        this.nextMessage = this.nextMessage.trim();
        if (this.nextMessage.length == 0) return;
        this.chatService.sendMessage2(timeStamp + ' | ' + this.account.getUsername() + " : " + this.nextMessage);
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
}
