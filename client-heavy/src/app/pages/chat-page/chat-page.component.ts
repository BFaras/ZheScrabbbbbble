import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChatInfo, ChatMessage, ChatType, MessageInfo } from '@app/classes/chat-info';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
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
    chatLog: Map<string, ChatMessage[]>;
    public: ChatType = ChatType.PUBLIC;
    private: ChatType = ChatType.PRIVATE;
    global: ChatType = ChatType.GLOBAL;
    visibility: ChatType;
    selectedChat: string;

    constructor(private changeDetector: ChangeDetectorRef, private chatService: ChatService, private account: AccountService) {
        chatService.getNewMessages().subscribe((messageInfo: MessageInfo) => {
            this.chatText += messageInfo + '\n';
        })
    }

    ngOnInit() {

        this.chatService.getChatsList().subscribe((chatList: ChatInfo[]) => {
            this.chatList = chatList;
        });
        this.chatLog = this.chatService.messageLog;

    }

    /*
    mockChatLog() {
        this.chatLog.set("1", [{ message: "hello", username: "daria", timestamp: "12:00", },
        { message: "hi", username: "frank", timestamp: "12:00", },
        { message: "how are you", username: "daria", timestamp: "12:00", },
        { message: "good you", username: "frank", timestamp: "12:00", },
        { message: "yes same", username: "daria", timestamp: "12:00", },]);
        this.chatLog.set("2", [{ message: "hello", username: "mary", timestamp: "12:00", },
        { message: "hi", username: "john", timestamp: "12:00", },
        { message: "how are you", username: "mary", timestamp: "12:00", },
        { message: "good you", username: "john", timestamp: "12:00", },
        { message: "yes same", username: "mary", timestamp: "12:00", },]);
    }

    mockChatlist() {
        this.chatList = [
            {
                chatName: "Daria",
                _id: "1",
                chatType: ChatType.PRIVATE,
            },
            {
                chatName: "Mary",
                _id: "2",
                chatType: ChatType.PUBLIC,
            },
        ]
    }
    */
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
        /*
        this.chatLog.set("6403648f2ac642cda023ef88", [{ message: "hello", username: "daria", timestamp: "12:00", },
        { message: "hi", username: "frank", timestamp: "12:00", },
        { message: "how are you", username: "daria", timestamp: "12:00", },
        { message: "good you", username: "frank", timestamp: "12:00", },
        { message: "yes same", username: "daria", timestamp: "12:00", },
        { message: "hi", username: "frank", timestamp: "12:00", },
        { message: "how are you", username: "daria", timestamp: "12:00", },
        { message: "good you", username: "frank", timestamp: "12:00", },
        { message: "yes, i am very well. I want to write a super long message", username: "daria", timestamp: "12:00", },
        { message: "hi", username: "frank", timestamp: "12:00", },
        { message: "how are you", username: "daria", timestamp: "12:00", },
        { message: "good you", username: "frank", timestamp: "12:00", },
        { message: "yes same", username: "daria", timestamp: "12:00", },
        { message: "hi", username: "frank", timestamp: "12:00", },
        { message: "how are you", username: "daria", timestamp: "12:00", },
        { message: "good you", username: "frank", timestamp: "12:00", },
        { message: "yes same", username: "daria", timestamp: "12:00", },]);
        */
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
