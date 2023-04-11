import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatInfo, ChatType } from '@app/classes/chat-info';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';

@Component({
  selector: 'app-public-chats',
  templateUrl: './public-chats.component.html',
  styleUrls: ['./public-chats.component.scss']
})
export class PublicChatsComponent implements OnInit {
  absentChatList: ChatInfo[];
  presentChatList: ChatInfo[] = [];
  activeInput: number;

  constructor(private chatService: ChatService, private snackBar: MatSnackBar, private account: AccountService) {
    this.updateChats();
  }

  updateChats() {
    this.chatService.getPublicChatObservable().subscribe((publicChats: ChatInfo[]) => {
      this.absentChatList = publicChats;
    })
    this.chatService.getPublicChats();
    this.chatService.getChatsList().subscribe((chatList: ChatInfo[]) => {
      const newChats: ChatInfo[] = [];
      chatList.forEach((chat: ChatInfo) => {
        if (chat.chatType === ChatType.PUBLIC) newChats.push(chat);
        this.presentChatList = newChats;
      });
    })
  }

  ngOnInit(): void {

  }

  alert(chat: ChatInfo) {
    const text = this.account.getLanguage() === 'fr' ? 'Êtes-vous sûr(e) de vouloir quitter ce chat?' : 'Are you sure you want to leave this chat?';
    if (confirm(text)) {
      this.chatService.leaveChat(chat).subscribe((errorCode: string) => {
        this.updateChats();
        console.log(errorCode);
      });
    }
  }

  joinChat(chat: ChatInfo) {
    this.chatService.joinChat(chat).subscribe((errorCode: string) => {
      this.updateChats();
      console.log(errorCode);
    });
  }

  addChat() {
    this.account.setMessages();
    const chatName = (document.getElementById('chat-name') as HTMLInputElement).value;
    if (chatName.length < 35) {
      this.chatService.createChat(chatName).subscribe((errorCode: string) => {
        this.updateChats();
        console.log(errorCode);
      });
    }
    else this.snackBar.open(this.account.messageChat, this.account.closeMessage);
    (document.getElementById('chat-name') as HTMLInputElement).value = "";
  }

  setActive(input: number) {
    this.activeInput = input;
  }

  searchFilter() {
    let input, filter, a, i, txtValue;
    let container: any = [];
    let containerDiv: any = [];
    let span: any = [];
    input = document.getElementsByClassName('chat-input');
    filter = (input[this.activeInput] as HTMLInputElement).value.toUpperCase();
    container = document.getElementsByClassName("chats-container");
    containerDiv = container[this.activeInput]!.getElementsByClassName("chat-container");
    for (let i = 0; i < containerDiv.length; i++) {
      span.push(containerDiv[i].getElementsByTagName('span'))
    }

    for (i = 0; i < span.length; i++) {
      a = span[i][0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        containerDiv[i].style.display = "";
      } else {
        containerDiv[i].style.display = "none";
      }
    }
  }

}
