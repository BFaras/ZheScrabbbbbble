import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Friend } from '@app/classes/friend-info';
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
  redirect: boolean = false;

  constructor(private snackBar: MatSnackBar, private friendsService: FriendsService, private account: AccountService, private router: Router) {
    this.updateFriendsList();
    this.friendsService.getFriendListUpdateObservable().subscribe(() => {
      console.log('FRIEND REMOVED SOCKET TEST');
      this.updateFriendsList();
    })
    this.usercode = this.account.getProfile().userCode;
  }

  alert(username: string) {
    const text = 'Êtes-vous sûr(e) de vouloir retirer cet ami?';
    if (confirm(text)) {
      this.friendsService.removeFriend(username).subscribe((errorCode: string) => {
        this.updateFriendsList();
        console.log(errorCode);
      });
    }
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
    } else
      this.snackBar.open("bruh make real friends", "Fermer");

    (document.getElementById('friendCode') as HTMLInputElement).value = "";
  }

  updateFriendsList() {
    this.subscriptions.push(this.friendsService.getFriendsListObservable().subscribe((friendsList: Friend[]) => {
      console.log('FRIEND LIST UPDATED');
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
}
