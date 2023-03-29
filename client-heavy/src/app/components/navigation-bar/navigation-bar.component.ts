import { Component, EventEmitter, Output } from '@angular/core';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {

  @Output("navLogic") navLogic: EventEmitter<void> = new EventEmitter();
  active: boolean = true;
  constructor(private socketManager: SocketManagerService) {}

  disconnectUser() {
    this.socketManager.getSocket().disconnect();
    this.socketManager.createSocket();
  }

  callNavLogic() {
    this.navLogic.emit();
  }

  openChat() {
    (window as any).openChat();
  }

  setActive(chat: boolean) {
    this.active = chat;
  }
}
