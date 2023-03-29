import { Injectable } from '@angular/core';
import { Friend } from '@app/classes/friend-info';
import { Observable, Observer } from 'rxjs';
import { SocketManagerService } from './socket-manager-service/socket-manager.service';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

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


}
