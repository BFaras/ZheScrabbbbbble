import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {

  @Output("navLogic") navLogic: EventEmitter<void> = new EventEmitter();

  constructor(private socketManager: SocketManagerService) {}

  ngOnInit(): void {
  }

  disconnectUser() {
    this.socketManager.getSocket().disconnect();
    this.socketManager.createSocket();

  }

  callNavLogic() {
    this.navLogic.emit();
  }

}
