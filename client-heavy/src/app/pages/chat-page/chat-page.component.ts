import { AfterContentChecked, ChangeDetectorRef, Component } from '@angular/core';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';

@Component({
    selector: 'app-chat-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements AfterContentChecked {
    chatText: string = '';
    nextMessage: string = '';
    timeStamp: string = "";

    constructor(private changeDetector: ChangeDetectorRef, private chatService: ChatService, private account: AccountService) {
        chatService.getNewMessages().subscribe((message: string) => {
            console.log("test1")
            this.chatText += message + '\n';
        })
    }


    createTimeStamp() {
        var date = new Date()
        date.setTime(date.getTime())
        this.timeStamp = " " + date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getSeconds().toString() + " "
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }


<<<<<<< HEAD
    sendMessage() {
        if (this.nextMessage.length == 0) return;
        this.chatService.sendMessage2(this.nextMessage);
=======
    sendMessage(){
        this.createTimeStamp()
        console.log(this.timeStamp)
        console.log(this.account.getUsername())
        console.log(this.nextMessage)
        if(this.nextMessage.length == 0) return;
        this.chatService.sendMessage2(this.timeStamp + this.account.getUsername() + " "+ this.nextMessage);
>>>>>>> 30c5ed0616ffcdc5d75cdc0ee307eea136baf0aa
        this.nextMessage = '';
    }

    updateScroll(scroll: number): number {
        return scroll;
    }
}
