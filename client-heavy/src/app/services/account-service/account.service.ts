import { Injectable } from '@angular/core';
import { ProfileInfo, ProfileSettings } from '@app/classes/profileInfo';
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
  setUsername(username: string) {
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

  changeTheme(theme: string) {
    this.socket.emit('Change Theme', theme);
  }

  changeLanguage(lang: string) {
    this.socket.emit('Change Language', lang);
  }

  getAvatarChangeStatus(): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      this.socket.on('Avatar Change Response', (status: string) => {
        observer.next(status);
      });
    });
  }

  getThemeAndLanguage(): Observable<ProfileSettings> {
    this.socket.emit('Get Theme and Language');
    return new Observable((observer: Observer<ProfileSettings>) => {
      this.socket.on('Theme and Language Response', (theme: string, lang: string) => {
        const profile: ProfileSettings = { theme: theme, language: lang };
        observer.next(profile);
      });
    });
  }
}
