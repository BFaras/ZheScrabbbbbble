import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChatInfo, ChatMessage, ChatType, MessageInfo } from '@app/classes/chat-info';
import { AccountService } from '@app/services/account-service/account.service';
//import { AccountService } from '@app/services/account-service/account.service';
import { Router } from '@angular/router';
import { ConnectivityStatus, Friend } from '@app/classes/friend-info';
import { LanguageComponent } from '@app/components/language/language.component';
import { ChatService } from '@app/services/chat-service/chat.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { ThemesService } from '@app/services/themes-service/themes-service';
import { Subscription } from 'rxjs';

//import { chat, chatlist } from './chats';

@Component({
    selector: 'app-chat-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements OnInit, ViewChildren, AfterViewChecked {
    @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef;
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
    updateScrollStatus = false;
    //chatButton: HTMLElement;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private chatService: ChatService,
        private account: AccountService,
        private router: Router,
        private themeService: ThemesService,
        private languageComponent: LanguageComponent,
        private accountService: AccountService,
        private socketManagerService: SocketManagerService,
        /*private friendsPage: FriendsPageComponent*/) {
        this.username = this.account.getUsername();
        if (!this.username) {
            this.isPopup = true;
            this.importMainWindowsData();
        }
    }
    ngAfterViewChecked(): void {
        if (this.updateScrollStatus) {
            this.scrollBottom()
            this.updateScrollStatus = false
        }
    }

    ngOnInit() {
        this.socketManagerService.getSocket().on('Chat Deleted', (chatCode: string) => {
            if (this.chatService.isUserInChat(chatCode)) {
                this.subscriptions.push(this.chatService.getChatsList().subscribe((chatList: ChatInfo[]) => {
                    this.chatList = chatList;
                    this.updateScrollStatus = true
                }));
            }
        });
        this.updateChatsList();
        this.subscriptions.push(this.chatService.getNewMessages().subscribe((messageInfo: MessageInfo) => {
            if (messageInfo.id === this.selectedChat) {
                this.chatLog.push(messageInfo.message);
                this.updateScrollStatus = true
            }
        }));
    }

    public scrollBottom() {
        this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;

    }

    updateGameRoomChat() {
        for (let i = 0; i < this.chatList.length; i++) {
            if (this.chatList[i].chatName === 'Room Chat' && this.chatList[i].chatType === ChatType.GLOBAL) {
                this.chatList.splice(i, 1);
                break;
            }
        }
        const chatId = localStorage.getItem('gameRoomChat');
        if (!chatId) {
            this.chatService.unlinkGameChat();
            this.changeDetector.detectChanges();
            this.selectedChat = "";
            return;
        };
        this.chatService.linkGameChat(chatId);
        this.chatList.push({ chatName: 'Room Chat', chatType: ChatType.GLOBAL, _id: chatId, isChatOwner: false });
        this.chatService.updateChatList(this.chatList);
        this.changeDetector.detectChanges();
    }

    importMainWindowsData() {
        const accountInfo = localStorage.getItem('account');
        if (!accountInfo) return;
        this.account.setFullAccountInfo(JSON.parse(accountInfo));
        this.username = this.account.getUsername();
        this.chatService.linkSocketToUsername(this.username);
        if ((window as any).setCallbacks) {
            (window as any).setCallbacks(this.updateTheme.bind(this), this.updateLanguage.bind(this), this.updateGameRoomChat.bind(this));
            this.updateTheme();
            this.updateLanguage(false);
        }
    }

    openPopupChat() {
        if ((window as any).openChat) {
            (window as any).openChat(this.accountService.getFullAccountInfo(), this.themeService.getActiveTheme(), this.accountService.getLanguage());
            this.router.navigate(['/home']);
        }
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

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) subscription.unsubscribe();
        this.socketManagerService.getSocket().removeAllListeners('Chat Deleted');
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

    setVisibility(newVisibility: ChatType) {
        this.visibility = newVisibility;
        this.selectedChat = "";
        this.setDisabled();
        let chatLinks;
        chatLinks = document.getElementsByClassName("tabs");
        let chatId = '';
        switch (newVisibility) {
            case ChatType.GLOBAL:
                chatId = 'global';
                break;
            case ChatType.PRIVATE:
                chatId = 'private';
                break;
            case ChatType.PUBLIC:
                chatId = 'public';
                break;
        }
        for (let i = 0; i < chatLinks.length; i++) {
            if (chatLinks[i].id === chatId) {
                chatLinks[i].className += " active";
            } else {
                chatLinks[i].className = chatLinks[i].className.replace(" active", "");
            }
        }
    }

    selectChat(id: string) {
        this.selectedChat = id;
        this.setChatHistory(this.selectedChat);
        this.setDisabled();
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

    private updateChatsList() {
        this.chatService.getChatsList().subscribe((chatList: ChatInfo[]) => {
            this.chatList = chatList;
            this.updateGameRoomChat();
            const friendToSelect = this.chatService.getFriendToSelect();
            if (friendToSelect) {
                console.log('FOUND FRIEND');
                console.log(friendToSelect);
                this.chatService.setFriendToSelect('');
                for (const chat of this.chatList) {
                    console.log('user: ' + chat.chatName);
                    if (chat.chatName !== friendToSelect) continue;
                    this.setVisibility(chat.chatType);
                    this.selectChat(chat._id);
                    break;
                }
            }
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
        });
    }
}
