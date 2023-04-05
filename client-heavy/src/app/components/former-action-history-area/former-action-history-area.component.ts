import { Component, Input, OnInit } from '@angular/core';
import { VICTORY_STATUS } from '@app/classes/action-history';
import { GameHistoryInfo } from '@app/classes/profileInfo';
const DEFEAT = 'PROFILE-PAGE.LOSS';
const VICTORY = 'PROFILE-PAGE.WIN';
@Component({
  selector: 'app-former-action-history-area',
  templateUrl: './former-action-history-area.component.html',
  styleUrls: ['./former-action-history-area.component.scss']
})
export class FormerActionHistoryAreaComponent implements OnInit {
  //il faut mettre interaction quand ce sera ready du cote serveur
  @Input() formerActionsHistory: GameHistoryInfo[];
  constructor() {
  }

  ngOnInit(): void {

  }

  test() {
    console.log(this.formerActionsHistory)
  }
  checkStatus(indexAction: number) {
    if (this.formerActionsHistory[indexAction].isWinner === VICTORY_STATUS)
      return VICTORY;
    return DEFEAT;
  }

}
