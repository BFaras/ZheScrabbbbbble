import { Component, OnInit } from '@angular/core';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {

  constructor(private socketManager: SocketManagerService) {}

  ngOnInit(): void {
  }

  disconnectUser() {
    this.socketManager.getSocket().disconnect();
    this.socketManager.createSocket();

  }

}
