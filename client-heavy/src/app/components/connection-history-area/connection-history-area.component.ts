import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { connectionHistory } from '@app/classes/connection-history';
import { ConnectionInfo } from '@app/classes/profileInfo';

@Component({
  selector: 'app-connection-history-area',
  templateUrl: './connection-history-area.component.html',
  styleUrls: ['./connection-history-area.component.scss']
})
export class ConnectionHistoryAreaComponent implements OnInit, AfterViewInit {
  @ViewChild('scroll', { read: ElementRef }) public scroll: ElementRef;
  @Input() connectionInformation: ConnectionInfo[];
  connectionMode = true;
  connectionHistory: connectionHistory = {
    connections: [],
    disconnections: [],
  };
  constructor() {
  }

  public scrollBottom() {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;

  }

  public scrollToTop() {
    this.scroll.nativeElement.scrollTop = 0;
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

  ngAfterViewInit() {
    this.scrollBottom()
  }

  changeToConnection(event: Event) {
    this.connectionMode = true;
    this.setActive(event);
    this.scrollBottom()
  }

  changeToDisconnection(event: Event) {
    this.connectionMode = false;
    this.setActive(event);
    this.scrollBottom()
  }

  setActive(event: Event) {
    let tabsLinks;
    tabsLinks = document.getElementsByClassName("tabs");
    for (let i = 0; i < tabsLinks.length; i++) {
      tabsLinks[i].className = tabsLinks[i].className.replace(" active", "");
    }
    (event.currentTarget! as HTMLTextAreaElement).className += " active";
    this.scrollBottom()
  }
}
