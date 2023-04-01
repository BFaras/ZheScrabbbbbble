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
  private avatarUserMap: Map<string, string> = new Map<string, string>();

  constructor(private socketManagerService: SocketManagerService) {
    this.setUpSocket()
  }

  setUpSocket() {
    this.socket = this.socketManagerService.getSocket();
  }
  /**avant de ask les avatars il faut set usersinROOM */
  setUsersInRoom(usersInRoom: string[]) {
    this.usersInRoom = usersInRoom;
  }
  /**quand il faut trouver avatar par nom dans les endroit ou il y a pas d ordre */
  getAvatarUserMap(username: string) {
    if (this.avatarUserMap.get(username))
      return this.avatarUserMap.get(username);
    return "";
  }
  /**pour utiliser les noms des users */
  getUsersInRoom() {
    return this.usersInRoom;
  }
  /**Pour le host qui cree le jeu */
  setAvatarOfUsers(avatarOfUsers: string[]) {
    this.avatarOfUsers = avatarOfUsers;
  }
  /** pour get avatars des utilisateur et le mettre dans une liste dans component pour le montrer ou l ordre est important*/
  getAvatarOfUsers() {
    return this.avatarOfUsers;
  }
  /**pour event */
  askAllUsersAvatar() {
    console.log(this.getUsersInRoom())
    this.socket.emit('Get All Users Avatar Information', this.getUsersInRoom());
  }
  /**pour mettre avatars selon index */
  prepareMap(avatars: string[]) {
    this.usersInRoom.forEach((user, indexUser) => {
      this.avatarUserMap.set(user, avatars[indexUser])
    })
  }
  getUsersInRoomAvatarObservable(): Observable<string[]> {
    return new Observable((observer: Observer<string[]>) => {
      this.socket.on('Get All Users Avatar Information Response', (usernameAvatar) => {
        console.log(usernameAvatar)

        this.prepareMap(usernameAvatar);

        observer.next(usernameAvatar);
      });
    });
  }


}
