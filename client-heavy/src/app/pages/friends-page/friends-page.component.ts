import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectivityStatus, Friend } from '@app/classes/friend-info';
import { ProfileInfo } from '@app/classes/profileInfo';
import { AccountService } from '@app/services/account-service/account.service';
import { FriendsService } from '@app/services/friends.service';
import { SnackBarHandlerService } from '@app/services/snack-bar-handler.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-friends-page',
  templateUrl: './friends-page.component.html',
  styleUrls: ['./friends-page.component.scss']
})
export class FriendsPageComponent implements OnDestroy {
  friends: Friend[] = [];
  usercode: string = "";
  subscriptions: Subscription[] = [];
  profile: ProfileInfo;
  username: string = "";
  redirect: boolean = false;

  constructor(private snackBarHandler: SnackBarHandlerService, private friendsService: FriendsService, private account: AccountService, private router: Router) {
    this.updateFriendsList();
    this.friendsService.getFriendListUpdateObservable().subscribe(() => {
      console.log('FRIEND REMOVED SOCKET TEST');
      this.updateFriendsList();
    })
    this.usercode = this.account.getProfile().userCode;
  }


  alert(username: string) {
    this.account.setMessages();
    if (confirm(this.account.messageUnfriend)) {
      this.friendsService.removeFriend(username).subscribe((errorCode: string) => {
        this.updateFriendsList();
        console.log(errorCode);
      });
    }
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) subscription.unsubscribe();
    this.snackBarHandler.closeAlert();
  }

  addFriend() {
    this.account.setMessages();
    const friendCode = (document.getElementById('friendCode') as HTMLInputElement).value;
    if (friendCode !== this.usercode) {
      this.friendsService.addFriend(friendCode).subscribe((errorCode: string) => {
        this.updateFriendsList();
        console.log(errorCode);
      });
    } else
      this.snackBarHandler.makeAnAlert(this.account.messageFriend, this.account.closeMessage);

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

  goToProfile(username: string) {
    this.friendsService.setMode(false);
    this.friendsService.setUsername(username);
    this.friendsService.getFriendsProfile(username).subscribe((userProfile) => {
      this.friendsService.setUpProfile(userProfile);
      this.router.navigate(['/profile-page']);
    });
  }

  createGameWithInvite(friend: Friend) {
    if (friend.status !== ConnectivityStatus.ONLINE) return;
    this.friendsService.setFriendToInvite(friend.username);
    this.router.navigate(['/create-game']);
  }
}
