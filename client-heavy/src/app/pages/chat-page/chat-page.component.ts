import { Component, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { ChatService } from '@app/services/chat-service/chat.service';

@Component({
    selector: 'app-chat-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements AfterContentChecked{
    chatText : string = '';
    nextMessage: string = '';
    timeStamp: string = "";

    constructor(private changeDetector: ChangeDetectorRef, private chatService: ChatService) {
        chatService.getNewMessages().subscribe((message: string) => {
            this.chatText += message + '\n';
        })
    }

    createTimeStamp(){
        var date = new Date()
        date.setTime(date.getTime())
        this.timeStamp =  date.getHours().toString()+ ":"+ date.getMinutes().toString() + ":" + date.getSeconds().toString() + " "
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }


    sendMessage(){
        this.createTimeStamp()
        console.log(this.timeStamp)
        if(this.nextMessage.length == 0) return;
        this.chatService.sendMessage2(this.timeStamp + this.nextMessage);
        this.nextMessage = '';
    }

    updateScroll(scroll : number): number{
        return scroll;
    }
}
