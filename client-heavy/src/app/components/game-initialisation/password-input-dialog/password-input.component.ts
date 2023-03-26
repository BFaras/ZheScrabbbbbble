import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ChatService } from "@app/services/chat-service/chat.service";
import { JoinResponse, WaitingRoomManagerService } from "@app/services/waiting-room-manager-service/waiting-room-manager.service";
import { first } from "rxjs/operators";

@Component({
    selector: 'app-password-input',
    templateUrl: './password-input.component.html',
    styleUrls: ['./password-input.component.scss'],
})
export class PasswordInputComponent {
    password: string;
    messageType: number = 0;

    constructor(private dialogRef: MatDialogRef<PasswordInputComponent>, 
        private waitingRoomManagerService: WaitingRoomManagerService, 
        @Inject(MAT_DIALOG_DATA) private data: string,
        private chatService:ChatService) {}

    submitPassword() {
        this.waitingRoomManagerService.joinRoomResponse().pipe(first()).subscribe(this.terminateDialog.bind(this));
        this.chatService.setChatInGameRoom(this.data);
        this.waitingRoomManagerService.joinRoom(this.data, this.password);
    }

    terminateDialog(message: JoinResponse) {
        if (message.errorCode === 'ROOM-2') {
            this.messageType = 1;
            return;
        }
        if (message.errorCode === 'ROOM-4') {
            this.messageType = 2;
            return;
        }
        if (!message.playerNames) {
            this.messageType = 3;
            return;
        }
        this.dialogRef.close(message.playerNames);
    }

    closeDialog() {
        this.dialogRef.close();
    }
}