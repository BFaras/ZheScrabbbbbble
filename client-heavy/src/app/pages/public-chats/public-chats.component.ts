import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatInfo, ChatType } from '@app/classes/chat-info';
import { ConfrimPopUpComponent } from '@app/components/confrim-pop-up/confrim-pop-up.component';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { SnackBarHandlerService } from '@app/services/snack-bar-handler.service';

@Component({
  selector: 'app-public-chats',
  templateUrl: './public-chats.component.html',
  styleUrls: ['./public-chats.component.scss']
})
export class PublicChatsComponent implements OnInit, OnDestroy {
  absentChatList: ChatInfo[];
  presentChatList: ChatInfo[] = [];
  activeInput: number;

  constructor(public dialog: MatDialog, private chatService: ChatService, private snackBarHandler: SnackBarHandlerService, private account: AccountService) {
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

  ngOnDestroy(): void {
    this.snackBarHandler.closeAlert()
  }

  ngOnInit(): void {

  }

  alert(chat: ChatInfo) {
    const text = this.account.getLanguage() === 'fr' ? 'Êtes-vous sûr(e) de vouloir quitter ce chat?' : 'Are you sure you want to leave this chat?';
    const dialogRef = this.dialog.open(ConfrimPopUpComponent, {
      width: '450px',
      height: '230px',
      data: { notification: text }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("subscription works")
      console.log(result)
      if (result === undefined) {
        this.dialogResponse(false, chat)
      } else {
        this.dialogResponse(result.status, chat);
      }
    });
  }

  dialogResponse(status: boolean, chat: ChatInfo) {
    if (status) {
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
    else this.snackBarHandler.makeAnAlert(this.account.messageChat, this.account.closeMessage);
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
