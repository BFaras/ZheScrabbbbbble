import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { AccountService } from '@app/services/account-service/account.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
  chatOpen: boolean = false;
  @Output("navLogic") navLogic: EventEmitter<void> = new EventEmitter();
  constructor(private socketManager: SocketManagerService, private accountService : AccountService, private changeDetector: ChangeDetectorRef,) {
    (window as any).setChatStatusCallback(this.updateChatStatus.bind(this));
    this.chatOpen = (window as any).chatOpen;
  }

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

  updateChatStatus(){
    this.chatOpen = (window as any).chatOpen;
    this.changeDetector.detectChanges();
  }
}
