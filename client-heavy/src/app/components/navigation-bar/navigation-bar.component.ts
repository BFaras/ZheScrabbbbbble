import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account-service/account.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { FriendsService } from '@app/services/friends.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { JoinResponse, WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { first } from 'rxjs/operators';
import { ConfrimPopUpComponent } from '../confrim-pop-up/confrim-pop-up.component';
@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  @Output("navLogic") navLogic: EventEmitter<void> = new EventEmitter();

  constructor(private socketManager: SocketManagerService,
    private snackBar: MatSnackBar, private router: Router,
    private friends: FriendsService,
    private chatService: ChatService,
    private changeDetector: ChangeDetectorRef,
    private waitingRoomManagerService: WaitingRoomManagerService,
    private account: AccountService,
    public dialog: MatDialog) {
    this.chatService.setChangeDetector(this.changeDetector);
    this.waitingRoomManagerService.getFriendInviteObservable().subscribe((data: { username: string, gameID: string }) => {
      const text = 'Do you want to join ' + data.username + ' in a game of Scrabble ?';
      this.alertJoinFriendGame(text, data)
    });
  }

  alertJoinFriendGame(text: string, data: { username: string, gameID: string }) {
    const dialogRef = this.dialog.open(ConfrimPopUpComponent, {
      width: '450px',
      height: '230px',
      data: { notification: text }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result === undefined) {
        this.dialogResponse(false, data)
      } else {
        this.dialogResponse(result.status, data);
      }
    });
  }

  resetFriend(){
    this.chatService.setFriendToSelect('');
  }

  dialogResponse(status: boolean, data: { username: string, gameID: string }) {
    if (status) {
      this.waitingRoomManagerService.joinRoomResponse().pipe(first()).subscribe(this.joinFriendRoom.bind(this));
      this.waitingRoomManagerService.joinFriendRoom(data.gameID);
    }
  }

  joinFriendRoom(message: JoinResponse) {
    this.account.setMessages();
    if (message.errorCode === 'ROOM-4') {
      this.snackBar.open(this.account.messageFull, this.account.closeMessage)
      return;
    }
    if (!message.playerNames) {
      // Should never reach here
      this.snackBar.open('Fatal server error. No player name received', "Fermer")
      return;
    }
    this.waitingRoomManagerService.setDefaultPlayersInRoom(message.playerNames);
    this.chatService.setChatInGameRoom(this.waitingRoomManagerService.getRoomToJoinId());
    this.router.navigate(['/waiting-room']);
  }

  disconnectUser() {
    this.socketManager.getSocket().disconnect();
    this.socketManager.createSocket();
  }

  callNavLogic() {
    this.navLogic.emit();
  }

  isPopupOpen(): boolean {
    return this.chatService.isPopupOpen();
  }

  setMode(mode: boolean) {
    this.friends.setMode(mode);
  }
}
