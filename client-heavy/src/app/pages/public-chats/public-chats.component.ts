import { Component, OnInit } from '@angular/core';
import { ChatInfo } from '@app/classes/chat-info';

@Component({
  selector: 'app-public-chats',
  templateUrl: './public-chats.component.html',
  styleUrls: ['./public-chats.component.scss']
})
export class PublicChatsComponent implements OnInit {
  chatList: ChatInfo[];

  constructor() {}

  ngOnInit(): void {
  }

  alert() {
    const text = 'Êtes-vous sûr(e) de vouloir quitter ce chat?';
    if (confirm(text)) {}
  }

}
