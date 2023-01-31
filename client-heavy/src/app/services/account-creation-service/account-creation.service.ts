import { Injectable } from '@angular/core';
import { Account } from '@app/classes/account';
import { Socket } from 'socket.io-client';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';

@Injectable({
  providedIn: 'root'
})
export class AccountCreationService {
  private socket:Socket
  constructor(private socketManagerService: SocketManagerService) {
    this.socket = this.socketManagerService.getSocket();
   }

  sendNewAccountInformation(account: Account): void {
    this.socket.emit('Create user account',account.username,account.password,account.email);
  }

}
