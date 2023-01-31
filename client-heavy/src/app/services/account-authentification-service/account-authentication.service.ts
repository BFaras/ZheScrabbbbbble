import { Injectable } from '@angular/core';
import { Account } from '@app/classes/account';
import { Observable, Observer } from 'rxjs';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';
@Injectable({
  providedIn: 'root'
})
export class AccountAuthenticationService {
  private socket;

  constructor(private socketManagerService: SocketManagerService) {
    this.socket = this.socketManagerService.getSocket();
   }

  LoginToAccount(account: Account): void {
    this.socket.emit('User authentification', account.username, account.password);
    
  }

  getStatusOfAuthentication():  Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.socket.on('Authentification status', (message: boolean) => {observer.next(message)
      });
    });
    
  }

}
