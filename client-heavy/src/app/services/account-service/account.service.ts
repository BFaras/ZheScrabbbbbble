import { Injectable } from '@angular/core';
import { ProfileInfo } from '@app/classes/profileInfo';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private username: string;
  private socket: Socket;
  private profile: ProfileInfo;
  constructor(private socketManagerService: SocketManagerService) {
    this.setUpSocket()
  }

  setUpSocket() {
    this.socket = this.socketManagerService.getSocket();
  }
  /* enlever cela apres quand profile sera obtenu*/
  public setUsername(username: string) {
    this.username = username;
  }
  /* enlever cela apres quand profile sera obtenu*/
  getUsername() {
    return this.username;
  }

  setUpProfile(profileInfo: ProfileInfo) {
    this.profile = profileInfo;
  }

  getProfile() {
    return this.profile;
  }

  askProfileInformation(): void {
    console.log(this.getUsername())
    this.socket.emit("Get Profile Information", this.getUsername());
  }

  getUserProfileInformation(): Observable<ProfileInfo> {
    return new Observable((observer: Observer<ProfileInfo>) => {
      this.socket.on('User Profile Response', (profileInfo: ProfileInfo) => {
        observer.next(profileInfo);
      });
    });

  }

  changeAvatar(newAvatar: string) {
    this.socket.emit('Change Avatar', newAvatar);
  }
  getAvatarChangeStatus(): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      this.socket.on('Avatar Change Response', (status: string) => {
        observer.next(status);
      });
    });

  }

  MakeAllAvatarBase64(AllAvatars: string[]): string[] {
    const BASE_64_FORMAT = "data:image/png;base64,";
    AllAvatars.forEach((value, index) => {
      AllAvatars[index] = BASE_64_FORMAT + AllAvatars[index];

    })

    return AllAvatars;
  }

  getAllAvatars() {
    this.socket.emit('Get All Avatars');
  }

  getAllAvatarsResponse(): Observable<string[]> {
    return new Observable((observer: Observer<string[]>) => {
      this.socket.once('Get All Avatars Response', (AllAvatars: string[]) => {
        observer.next(this.MakeAllAvatarBase64(AllAvatars));
      });
    });

  }

  changeUsername(newUsername: string) {
    this.socket.emit('Change Username', newUsername);
  }


  getChangeUserNameResponse(): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      this.socket.on('Username Change Response', (response: string) => {
        observer.next(response);
      });
    });

  }




}
