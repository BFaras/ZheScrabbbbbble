import { Injectable } from '@angular/core';
import { ProfileInfo, ProfileSettings } from '@app/classes/profileInfo';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';
import { ThemesService } from '../themes-service/themes-service';
@Injectable({
  providedIn: 'root'
})

export class AccountService {
  private username: string;
  private socket: Socket;
  private profile: ProfileInfo;
  private usercode: string;
  private avatars: string[] = ['daria.PNG', 'arnaud.PNG', 'imane.PNG', 'raphael.PNG', 'manuel.PNG', 'mohamed.PNG', 'cow.png', 'mouse.png', 'giraffe.png',
    'owl.png', 'monkey.png', 'cat.png', 'dog.png', 'alien.png', 'fox.png', 'pig.png', 'rooster.png', 'unicorn.png', 'lion.png', 'bear.png', 'koala.png', 'ghost.png',
    'shark.png', 'panda.png', 'tiger.png', 'skeleton.png', 'bunny.png'];
  private lockedAvatars: string[] = ['shark.png', 'panda.png', 'tiger.png', 'skeleton.png', 'bunny.png'];
  private language: string = 'fr';

  constructor(private socketManagerService: SocketManagerService, private themeService: ThemesService) {
    this.setUpSocket();
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

  getUserCode() {
    return this.usercode;
  }

  setUpProfile(profileInfo: ProfileInfo) {
    this.profile = profileInfo;
  }

  setUpUserCode(profile: ProfileInfo) {
    this.usercode = profile.userCode;
  }

  getProfile() {
    return this.profile;
  }

  getLanguage(): string {
    return this.language;
  }

  setLanguage(language: string) {
    this.language = language;
  }

  getFullAccountInfo(): { username: string, profile: ProfileInfo, usercode: string } {
    return { username: this.username, profile: this.profile, usercode: this.usercode };
  }

  setFullAccountInfo(accountInfo: { username: string, profile: ProfileInfo, usercode: string }) {
    this.username = accountInfo.username;
    this.profile = accountInfo.profile;
    this.usercode = accountInfo.usercode;
  }

  getUserProfileInformation(): Observable<ProfileInfo> {
    this.socket.emit("Get Profile Information", this.getUsername());
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
    if ((window as any).updateTheme) {
      const themeObject = this.themeService.getThemeFromString(theme);
      if (!themeObject) return;
      (window as any).updateTheme(themeObject);
    }
    this.socket.emit('Change Theme', theme);
  }

  changeLanguage(lang: string) {
    if ((window as any).updateLanguage) {
      (window as any).updateLanguage(lang);
    }
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
      this.socket.once('Theme and Language Response', (theme: string, lang: string) => {
        const profile: ProfileSettings = { theme: theme, language: lang };
        observer.next(profile);
      });
    });
  }

  /*
  MakeAllAvatarBase64(AllAvatars: string[]): string[] {
    const BASE_64_FORMAT = "data:image/png;base64,";
    AllAvatars.forEach((value, index) => {
      AllAvatars[index] = BASE_64_FORMAT + AllAvatars[index];

    })

    return AllAvatars;
  }*/
  /*
  getAllAvatars() {
    this.socket.emit('Get All Avatars');
  }
  */
  /*
   getAllAvatarsResponse(): Observable<string[]> {
     return new Observable((observer: Observer<string[]>) => {
       this.socket.once('Get All Avatars Response', (AllAvatars: string[]) => {
         observer.next(this.MakeAllAvatarBase64(AllAvatars));
       });
     });
 
   }
   */

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

  updateAvatars() {
    let unlockedAvatars: string[] = [];

    if (this.profile.tournamentWins[0] >= 2) unlockedAvatars.push('bunny.png');
    if (this.profile.tournamentWins[0] >= 1) unlockedAvatars.push('skeleton.png');
    if (this.profile.levelInfo.level >= 6) unlockedAvatars.push('tiger.png');
    if (this.profile.levelInfo.level >= 4) unlockedAvatars.push('panda.png');
    if (this.profile.levelInfo.level >= 2) unlockedAvatars.push('shark.png');

    unlockedAvatars.forEach(avatar => {
      if (this.lockedAvatars.includes(avatar)) this.lockedAvatars.splice(this.lockedAvatars.indexOf(avatar), 1);
    });
  }

  getAvatars() {
    return this.avatars;
  }

  getLockedAvatars() {
    return this.lockedAvatars;
  }

  getDefaultAvatars() {
    return ['daria.PNG', 'arnaud.PNG', 'imane.PNG', 'raphael.PNG', 'manuel.PNG', 'mohamed.PNG', 'cow.png', 'mouse.png', 'giraffe.png',
      'owl.png', 'monkey.png', 'cat.png', 'dog.png', 'alien.png', 'fox.png', 'pig.png', 'rooster.png', 'unicorn.png', 'lion.png', 'bear.png', 'koala.png', 'ghost.png'];
  }

}
