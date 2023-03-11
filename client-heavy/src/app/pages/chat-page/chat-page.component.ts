import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChatInfo, ChatType, MessageInfo } from '@app/components/chat/chat-info';
import { classic, Theme } from '@app/constants/themes';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { ThemesService } from '@app/services/themes-service/themes-service';
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
    public: ChatType = ChatType.PUBLIC;
    private: ChatType = ChatType.PRIVATE;
    visibility: ChatType;

    constructor(private changeDetector: ChangeDetectorRef, private chatService: ChatService, private account: AccountService, private themes: ThemesService) {
        chatService.getNewMessages().subscribe((messageInfo: MessageInfo) => {
            this.chatText += messageInfo + '\n';
        })
    }

    ngOnInit() {
        let current = localStorage.getItem("currentTheme");
        if (current) {
            this.themes.getAvailableThemes().forEach((theme: Theme) => {
                if (theme.name.toString() === current) this.themes.setActiveTheme(theme);
            });
            localStorage.setItem("currentTheme", current);
        }
        else {
            localStorage.setItem("currentTheme", classic.toString());
        }
        this.chatService.getChatsList().subscribe((chatList: ChatInfo[]) => {
            this.chatList = chatList;
        });
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
