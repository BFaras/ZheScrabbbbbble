import { Component, EventEmitter, Output } from '@angular/core';
import { ChatService } from '@app/services/chat-service/chat.service';
import { FriendsService } from '@app/services/friends.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  active: string = "chat";
  @Output("navLogic") navLogic: EventEmitter<void> = new EventEmitter();
  constructor(private socketManager: SocketManagerService, private chatService: ChatService, private friends: FriendsService) {}

  disconnectUser() {
    this.socketManager.getSocket().disconnect();
    this.socketManager.createSocket();
  }

  callNavLogic() {
    this.navLogic.emit();
  }

  openChat(mode: string) {
    (window as any).openChat("hellooooooooo");
  }

  setActive(mode: string) {
    this.active = mode;
    this.chatService.setActive(mode);
  }

  setMode(mode: boolean) {
    this.friends.setMode(mode);
  }
}
