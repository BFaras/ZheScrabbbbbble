import { Component, Input, OnInit } from '@angular/core';
import { ActionHistory, VICTORY_STATUS } from '@app/classes/action-history';
const DEFEAT = 'PROFILE-PAGE.LOSS';
const VICTORY = 'PROFILE-PAGE.WIN';
@Component({
  selector: 'app-former-action-history-area',
  templateUrl: './former-action-history-area.component.html',
  styleUrls: ['./former-action-history-area.component.scss']
})
export class FormerActionHistoryAreaComponent implements OnInit {
  //il faut mettre interaction quand ce sera ready du cote serveur
  @Input() formerActionsHistory: ActionHistory[] = [{ time: "17:00:12 EST", date: "24/02/2024", status: 0 }, { time: "17:00:12 EST", date: "24/02/2024", status: 1 },
  { time: "17:00:12 EST", date: "24/02/2024", status: 0 }, { time: "17:00:12 EST", date: "24/02/2024", status: 1 },
  { time: "17:00:12 EST", date: "24/02/2024", status: 0 }, { time: "17:00:12 EST", date: "24/02/2024", status: 1 },
  { time: "17:00:12 EST", date: "24/02/2024", status: 0 }, { time: "17:00:12 EST", date: "24/02/2024", status: 1 },
  { time: "17:00:12 EST", date: "24/02/2024", status: 0 }, { time: "17:00:12 EST", date: "24/02/2024", status: 1 }];
  constructor() {
  }

  ngOnInit(): void {
    //ce sont des mocks
  }
  checkStatus(indexAction: number) {
    if (this.formerActionsHistory[indexAction].status === VICTORY_STATUS)
      return VICTORY;
    return DEFEAT;

  }

}
