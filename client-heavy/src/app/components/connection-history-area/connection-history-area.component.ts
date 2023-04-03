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

  changeToConnection() {
    this.connectionMode = true;
  }
  changeToDisconnection() {
    this.connectionMode = false;
  }

}
