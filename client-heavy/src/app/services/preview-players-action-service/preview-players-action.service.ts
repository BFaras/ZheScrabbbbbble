import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';

@Injectable({
  providedIn: 'root'
})
export class PreviewPlayersActionService {

  constructor(private socketManagerService:SocketManagerService) { }

  sharePlayerFirstTile(activeSquare: { x: string; y: number }){
    this.socketManagerService.getSocket().emit('Share First Tile',activeSquare);
  }

  getActivePlayerFirstTile(): Observable<{x:string, y :number}>{
    return new Observable((observer: Observer<{x:string, y :number}>) => {
      this.socketManagerService.getSocket().on('Get First Tile', (activeSquare:{x:string, y :number}) => observer.next(activeSquare))
    })
  }

  removeSelectedTile(activeSquare: { x: string; y: number }){
    this.socketManagerService.getSocket().emit('Remove Selected Tile',activeSquare);
  }

  getSelectedTileStatus(): Observable<{x:string, y :number}>{
    return new Observable((observer: Observer<{x:string, y :number}>) => {
      this.socketManagerService.getSocket().on('Remove Selected Tile Response', (activeSquare:{x:string, y :number}) => observer.next(activeSquare))
    })
  }

}
