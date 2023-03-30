import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketManagerService } from './socket-manager-service/socket-manager.service';

@Injectable({
  providedIn: 'root'
})
export class AvatarInRoomsService {
  private socket: Socket;
  private usersInRoom: string[];
  private avatarOfUsers: string[];

  constructor(private socketManagerService: SocketManagerService) {
    this.setUpSocket()
  }

  setUpSocket() {
    this.socket = this.socketManagerService.getSocket();
  }

  setUsersInRoom(usersInRoom: string[]) {
    this.usersInRoom = usersInRoom;
  }

  getUsersInRoom() {
    return this.usersInRoom;
  }

  setAvatarOfUsers(avatarOfUsers: string[]) {
    this.avatarOfUsers = avatarOfUsers;
  }

  getAvatarOfUsers() {
    return this.avatarOfUsers;
  }

  askAllUsersAvatar() {
    console.log(this.getUsersInRoom())
    this.socket.emit('Get All Users Avatar Information', this.getUsersInRoom());
  }
  getUsersInRoomAvatarObservable(): Observable<string[]> {
    return new Observable((observer: Observer<string[]>) => {
      this.socket.on('Get All Users Avatar Information Response', (usernameAvatar) => {
        observer.next(usernameAvatar);
      });
    });
  }


}
