import { Component } from '@angular/core';
import { Friend } from '@app/classes/friend-info';
import { AccountService } from '@app/services/account-service/account.service';
import { FriendsService } from '@app/services/friends.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-friends-page',
  templateUrl: './friends-page.component.html',
  styleUrls: ['./friends-page.component.scss']
})
export class FriendsPageComponent {
  friends: Friend[] = [];
  usercode: string = "";
  subscriptions: Subscription[] = [];

  constructor(private friendsService: FriendsService, private account: AccountService) {
    this.updateFriendsList();
    this.usercode = this.account.getProfile().userCode;
  }

  alert() {
    const text = 'Êtes-vous sûr(e) de vouloir retirer cet ami?';
    if (confirm(text)) {}
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) subscription.unsubscribe();
  }

  addFriend() {
    const friendCode = (document.getElementById('friendCode') as HTMLInputElement).value;
    this.friendsService.addFriend(friendCode).subscribe((errorCode: string) => {
      this.updateFriendsList();
      console.log(errorCode);
    });
    (document.getElementById('friendCode') as HTMLInputElement).value = "";
  }

  updateFriendsList() {
    this.subscriptions.push(this.friendsService.getFriendsListObservable().subscribe((friendsList: Friend[]) => {
      this.friends = friendsList;
    }));
    this.friendsService.getFriendsList();
  }

}
