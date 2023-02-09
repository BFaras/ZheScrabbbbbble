import { AfterContentChecked, ChangeDetectorRef, Component } from '@angular/core';
import { ChatService } from '@app/services/chat-service/chat.service';

@Component({
    selector: 'app-chat-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements AfterContentChecked {
    chatText: string = '';
    nextMessage: string = '';

    constructor(private changeDetector: ChangeDetectorRef, private chatService: ChatService) {
        chatService.getNewMessages().subscribe((message: string) => {
            this.chatText += message + '\n';
        })
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }


    sendMessage() {
        if (this.nextMessage.length == 0) return;
        this.chatService.sendMessage2(this.nextMessage);
        this.nextMessage = '';
    }

    updateScroll(scroll: number): number {
        return scroll;
    }
}
