import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ChatInfo, ChatMessage, ChatType, MessageInfo } from '@app/classes/chat-info';
import { AccountService } from '@app/services/account-service/account.service';
//import { AccountService } from '@app/services/account-service/account.service';
import { Router } from '@angular/router';
import { ConnectivityStatus, Friend } from '@app/classes/friend-info';
import { LanguageComponent } from '@app/components/language/language.component';
import { ChatService } from '@app/services/chat-service/chat.service';
import { ThemesService } from '@app/services/themes-service/themes-service';
import { Subscription } from 'rxjs';

//import { chat, chatlist } from './chats';

@Component({
    selector: 'app-chat-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements AfterContentChecked, OnInit, AfterViewInit, ViewChildren {
    @ViewChildren('chat-button') chatItems: QueryList<ElementRef>;

    chatText: string = '';
    nextMessage: string = '';
    chatList: ChatInfo[];
    chatLog: ChatMessage[] = [];
    public: ChatType = ChatType.PUBLIC;
    private: ChatType = ChatType.PRIVATE;
    global: ChatType = ChatType.GLOBAL;
    visibility: ChatType = this.global;
    selectedChat: string;
    subscriptions: Subscription[] = [];
    username: string;
    isDisabled: boolean = true;
    friend: Friend = { username: 'cat', status: ConnectivityStatus.ONLINE };
    redirect: boolean = false;
    angular: any;
    descendants: boolean;
    emitDistinctChangesOnly: boolean;
    first: boolean;
    read: any;
    isViewQuery: boolean;
    selector: any;
    static?: boolean | undefined;
    isPopup: boolean = false;
    //chatButton: HTMLElement;

    constructor(private changeDetector: ChangeDetectorRef,
        private chatService: ChatService,
        private account: AccountService,
        private router: Router,
        private themeService: ThemesService,
        private languageComponent: LanguageComponent
        /*private friendsPage: FriendsPageComponent*/) {
        this.username = this.account.getUsername();
        if (!this.username) {
            this.isPopup = true;
            this.importMainWindowsData();
        }
    }

    ngOnInit() {
        this.subscriptions.push(this.chatService.getChatsList().subscribe((chatList: ChatInfo[]) => {
            this.chatList = chatList;
            if (this.selectedChat) {
                this.setChatHistory(this.selectedChat);
            }
            /*
            this.setFriendRedirect();
            if (true) {
                
                let chatId: string = "";
                this.chatList.forEach((chat: ChatInfo) => {
                    if (this.friend.username === chat.chatName && chat.chatType === this.private) chatId = chat._id;
                });
                //document.querySelectorAll(chatId);
                document.getElementById('private')!.click();
                this.redirect = false;
            }
            */
        }));
        this.subscriptions.push(this.chatService.getNewMessages().subscribe((messageInfo: MessageInfo) => {
            if (messageInfo.id === this.selectedChat) {
                this.chatLog.push(messageInfo.message);
            }
        }));
    }

    public ngAfterViewInit() {
        /*
        if (this.redirect) {
            //let chatId: string = "";
            let chatIndex: number = 0;
            this.chatList.forEach((chat: ChatInfo, index: number) => {
                if (this.friend.username === chat.chatName && chat.chatType === this.private) {
                    //chatId = chat._id;
                    chatIndex = index;
                }
            });
            //let privateChats = this.chatList.filter((chat: ChatInfo) => chat.chatType === ChatType.PRIVATE);
            this.chatItems.forEach((item, index) => {
                if (index === chatIndex) (item.nativeElement as HTMLElement).click();
            });
        }
        */
    }

    importMainWindowsData() {
        const accountInfo = localStorage.getItem('account');
        if (!accountInfo) return;
        this.account.setFullAccountInfo(JSON.parse(accountInfo));
        this.username = this.account.getUsername();
        this.chatService.linkSocketToUsername(this.username);
        (window as any).setCallbacks(this.updateTheme.bind(this), this.updateLanguage.bind(this));
        this.updateTheme();
        this.updateLanguage(false);
    }

    updateTheme() {
        const theme = localStorage.getItem('theme');
        if (!theme) return;
        this.themeService.setActiveTheme(JSON.parse(theme));
    }

    updateLanguage(isViewLoaded: boolean = true) {
        const language = localStorage.getItem('language');
        if (!language) return;
        this.languageComponent.translateLanguageTo(language, false);
        if (isViewLoaded) this.changeDetector.detectChanges();
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

    /*
    setFriendRedirect() {
        this.friend = this.friendsPage.friend;
        this.redirect = this.friendsPage.redirect;
        //this.friendsPage.redirect = false;
    }

    findFriend() {
        let chatId: string = "";
        this.chatList.forEach((chat: ChatInfo) => {
            if (this.friend.username === chat.chatName && chat.chatType === this.private) chatId = chat._id;
        });
        document.getElementById('private')!.click();
        document.getElementById(chatId)!.click();
    }
    */

    setVisibility(event: Event, newVisibility: ChatType) {
        this.visibility = newVisibility;
        this.selectedChat = "";
        this.setDisabled();

        let chatLinks;
        chatLinks = document.getElementsByClassName("tabs");
        for (let i = 0; i < chatLinks.length; i++) {
            chatLinks[i].className = chatLinks[i].className.replace(" active", "");
        }

        (event.currentTarget! as HTMLTextAreaElement).className += " active";
    }

    selectChat(event: Event, id: string) {
        this.selectedChat = id;
        this.setChatHistory(this.selectedChat);
        this.setDisabled();
        let chatButtons;
        chatButtons = document.getElementsByClassName("chat-button");
        for (let i = 0; i < chatButtons.length; i++) {
            chatButtons[i].className = chatButtons[i].className.replace(" selected", "");
        }
        (event.currentTarget! as HTMLTextAreaElement).className += " selected";
    }

    setDisabled() {
        if (this.selectedChat) this.isDisabled = false;
        else this.isDisabled = true;
    }

    goToChats() {
        this.router.navigate(['/public-chats']);
    }

    setChatHistory(chatId: string) {
        this.chatService.getChatHistory(chatId).subscribe((chatHistory: ChatMessage[]) => {
            this.chatLog = chatHistory;
        })
    }
}
