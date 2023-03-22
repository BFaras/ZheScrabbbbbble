import { Injectable } from '@angular/core';
import { Account } from '@app/classes/account';
import { Socket } from 'socket.io-client';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';
import { Observable, Observer} from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class AccountCreationService {
  private socket:Socket
  constructor(private socketManagerService: SocketManagerService) {
    this.setUpSocket()
   }

  setUpSocket(){
    this.socket = this.socketManagerService.getSocket();
  }
  sendNewAccountInformation(account: Account): void {
    this.socket.emit('Create user account',account.username,account.password,account.email, account.avatar, account.securityQuestion);
  }

  getStatusOfAccountCreation():  Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.socket.once('Creation result', (message: boolean) => {observer.next(message)
      });
    });
    
  }

  MakeAllAvatarBase64(AllAvatars:string[]): string[]{
    const BASE_64_FORMAT = "data:image/png;base64,";
    AllAvatars.forEach((value,index)=>{
      AllAvatars[index] = BASE_64_FORMAT + AllAvatars[index];

    })

    return AllAvatars;
  }

  getAllAvatars(){
    this.socket.emit('Get All Avatars');
  }

  getAllAvatarsResponse(): Observable<string[]> {
    return new Observable((observer: Observer<string[]>) => {
      this.socket.once('Get All Avatars Response', (AllAvatars: string[]) => {
        observer.next(this.MakeAllAvatarBase64(AllAvatars));
      });
    });

  }

}
