import { Component, EventEmitter, Output } from '@angular/core';
import { AccountService } from '@app/services/account-service/account.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  active: string = "chat";
  @Output("navLogic") navLogic: EventEmitter<void> = new EventEmitter();
  constructor(private socketManager: SocketManagerService, private accountService : AccountService) {}

  disconnectUser() {
    this.socketManager.getSocket().disconnect();
    this.socketManager.createSocket();
  }

  callNavLogic() {
    this.navLogic.emit();
  }

  openChat() {
    (window as any).openChat(this.accountService.getFullAccountInfo());
  }
}
