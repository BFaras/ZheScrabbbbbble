import { Injectable } from '@angular/core';
import { Account } from '@app/classes/account';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';
@Injectable({
  providedIn: 'root'
})
export class AccountAuthenticationService {
  private socket: Socket

  constructor(private socketManagerService: SocketManagerService) {
    this.setUpSocket()
  }

  setUpSocket() {
    this.socket = this.socketManagerService.getSocket();
  }

  LoginToAccount(account: Account): void {
    this.socket.emit('User authentification', account.username, account.password);

  }

  getStatusOfAuthentication(): Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.socket.once('Authentification status', (message: boolean) => {
        observer.next(message)
      });
    });

  }

  getUserQuestion(username:string){
    this.socket.emit("Reset User Password",username);
    return new Observable((observer: Observer<string>) => {
      this.socket.once('User Account Question', (question: string) => {
        observer.next(question)
      });
    });
  }


  modifyPassword(username:string,newPassword:string,answerToQuestion:string){
    this.socket.emit("Account Question Answer",username,answerToQuestion,newPassword);
    return new Observable((observer: Observer<string>) => {
      this.socket.once('Password Reset response', (errorCode: string) => {
        observer.next(errorCode)
      });
    });
  }

}
