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
    this.socket.emit('Create user account',account.username,account.password,account.email, "avatar", account.securityQuestion);
  }

  getStatusOfAccountCreation():  Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.socket.on('Creation result', (message: boolean) => {observer.next(message)
      });
    });
    
  }

}
