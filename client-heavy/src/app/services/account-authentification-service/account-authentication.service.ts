import { Injectable } from '@angular/core';
import { Account } from '@app/classes/account';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';
@Injectable({
  providedIn: 'root'
})
export class AccountAuthenticationService {
  private socket:Socket

  constructor(private socketManagerService: SocketManagerService) {
    this.setUpSocket()
   }

  setUpSocket(){
    this.socket = this.socketManagerService.getSocket();
  }

  LoginToAccount(account: Account): void {
    console.log(account.username)
    console.log(account.password)
    this.socket.emit('User authentification', account.username, account.password);
    
  }

  getStatusOfAuthentication():  Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.socket.on('Authentification status', (message: boolean) => {observer.next(message)
      });
    });
    
  }

}
