import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { ChatService } from '@app/services/chat-service/chat.service';
import { FriendsService } from '@app/services/friends.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  @Output("navLogic") navLogic: EventEmitter<void> = new EventEmitter();
  constructor(private socketManager: SocketManagerService, private friends: FriendsService, private chatService: ChatService, private changeDetector: ChangeDetectorRef) {
    this.chatService.setChangeDetector(this.changeDetector);
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
