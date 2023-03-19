import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-friends-page',
  templateUrl: './friends-page.component.html',
  styleUrls: ['./friends-page.component.scss']
})
export class FriendsPageComponent implements OnInit {
  requests: string[];
  friends: string[];

  constructor() {}

  ngOnInit(): void {
  }

  alert() {
    const text = 'Êtes-vous sûr(e) de vouloir retirer cet ami?';
    if (confirm(text)) {}
  }

}
