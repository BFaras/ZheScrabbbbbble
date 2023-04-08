import { Injectable } from '@angular/core';
import { Friend } from '@app/classes/friend-info';
import { ProfileInfo } from '@app/classes/profileInfo';
import { Observable, Observer } from 'rxjs';
import { SocketManagerService } from './socket-manager-service/socket-manager.service';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  friendProfile: ProfileInfo;
  mode: boolean = true;
  username: string;
  constructor(private socketManagerService: SocketManagerService) {}

  getFriendsListObservable(): Observable<Friend[]> {
    return new Observable((observer: Observer<Friend[]>) => {
      this.socketManagerService.getSocket().once('Friend List Response', (friendList: Friend[]) => {
        observer.next(friendList);
      });
    });
  }

  getFriendsList() {
    this.socketManagerService.getSocket().emit('Get Friend List');
  }

  addFriend(code: string): Observable<string> {
    this.socketManagerService.getSocket().emit('Send Friend Request', code);
    return new Observable((observer: Observer<string>) => {
      this.socketManagerService.getSocket().once('Send Request Response', (errorCode: string) => {
        observer.next(errorCode);
      });
    });
  }

  removeFriend(name: string): Observable<string> {
    this.socketManagerService.getSocket().emit('Remove Friend', name);
    return new Observable((observer: Observer<string>) => {
      this.socketManagerService.getSocket().once('Remove Friend Response', (errorCode: string) => {
        observer.next(errorCode);
      });
    });
  }

  getFriendsProfile(username: string): Observable<ProfileInfo> {
    this.socketManagerService.getSocket().emit("Get Profile Information", username);
    return new Observable((observer: Observer<ProfileInfo>) => {
      this.socketManagerService.getSocket().once('User Profile Response', (profileInfo: ProfileInfo) => {
        observer.next(profileInfo);
      });
    });
  }

  inviteFriend(username: string){
    this.socketManagerService.getSocket().emit('Invite Friend To Game', username);
  }

  setUpProfile(profileInfo: ProfileInfo) {
    this.friendProfile = profileInfo;
  }

  getProfile() {
    return this.friendProfile;
  }

  setMode(mode: boolean) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  setUsername(username: string) {
    this.username = username;
  }

  getUsername() {
    return this.username;
  }
}
