import { Component, OnInit } from '@angular/core';
import { ChatInfo, ChatType } from '@app/classes/chat-info';
import { ChatService } from '@app/services/chat-service/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public-chats',
  templateUrl: './public-chats.component.html',
  styleUrls: ['./public-chats.component.scss']
})
export class PublicChatsComponent implements OnInit {
  absentChatList: ChatInfo[];
  presentChatList: ChatInfo[] = [];
  subscriptions: Subscription[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.subscriptions.push(this.chatService.getPublicChatObservable().subscribe((publicChats: ChatInfo[]) => {
      this.absentChatList = publicChats;
    }));
    this.chatService.getPublicChats();
    this.subscriptions.push(this.chatService.getChatsList().subscribe((chatList: ChatInfo[]) => {
      chatList.forEach((chat: ChatInfo) => {
        if (chat.chatType === ChatType.PUBLIC) {
          this.presentChatList.push(chat);
        }
      });
    }));
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) subscription.unsubscribe();
  }

  alert(chat: ChatInfo) {
    const text = 'Êtes-vous sûr(e) de vouloir quitter ce chat?';
    if (confirm(text)) {
      this.chatService.leaveChat(chat);
    }
  }

  joinChat(chat: ChatInfo) {
    this.chatService.joinChat(chat);
  }

  addChat() {
    const chatName = (document.getElementById('chat-name') as HTMLInputElement).value;
    this.chatService.createChat(chatName);
    (document.getElementById('chat-name') as HTMLInputElement).value = "";
  }
}
