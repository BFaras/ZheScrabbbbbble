import { Component } from '@angular/core';
import { ConnectivityStatus, Friend } from '@app/classes/friend-info';
import { ProfileInfo } from '@app/classes/profileInfo';
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
  profile: ProfileInfo;
  username: string = "";
  friend: Friend = { username: 'cat', status: ConnectivityStatus.ONLINE };
  redirect: boolean = false;

  constructor(private friendsService: FriendsService, private account: AccountService, /*private router: Router*/) {
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
    if (friendCode !== this.usercode) {
      this.friendsService.addFriend(friendCode).subscribe((errorCode: string) => {
        this.updateFriendsList();
        console.log(errorCode);
      });
    } else alert("bruh make real friends");

    (document.getElementById('friendCode') as HTMLInputElement).value = "";
  }

  updateFriendsList() {
    this.subscriptions.push(this.friendsService.getFriendsListObservable().subscribe((friendsList: Friend[]) => {
      this.friends = friendsList;
    }));
    this.friendsService.getFriendsList();
  }

  setProfile(code: ProfileInfo) {
    this.profile = code;
  }

  /*
  openChat(friend: Friend) {
    //this.friend = friend;
    //this.redirect = true;
    this.router.navigate(['/chat']);
  }
  */
}
