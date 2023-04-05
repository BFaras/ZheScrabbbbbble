import { Component, Input, OnInit } from '@angular/core';
import { connectionHistory } from '@app/classes/connection-history';
import { ConnectionInfo } from '@app/classes/profileInfo';

@Component({
  selector: 'app-connection-history-area',
  templateUrl: './connection-history-area.component.html',
  styleUrls: ['./connection-history-area.component.scss']
})
export class ConnectionHistoryAreaComponent implements OnInit {

  @Input() connectionInformation: ConnectionInfo[];
  connectionMode = true;
  connectionHistory: connectionHistory = {
    connections: [],
    disconnections: [],
  };
  constructor() {
  }

  ngOnInit(): void {
    this.connectionInformation.forEach((connectionMoment) => {
      if (connectionMoment.connectionType === 0) {
        this.connectionHistory.connections.push(connectionMoment);
      } else {
        this.connectionHistory.disconnections.push(connectionMoment);
      }
    })
  }

  changeToConnection(event: Event) {
    this.connectionMode = true;
    this.setActive(event);
  }

  changeToDisconnection(event: Event) {
    this.connectionMode = false;
    this.setActive(event);
  }

  setActive(event: Event) {
    let tabsLinks;
    tabsLinks = document.getElementsByClassName("tabs");
    for (let i = 0; i < tabsLinks.length; i++) {
      tabsLinks[i].className = tabsLinks[i].className.replace(" active", "");
    }
    (event.currentTarget! as HTMLTextAreaElement).className += " active";
  }
}
