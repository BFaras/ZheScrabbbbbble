import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';

@Injectable({
  providedIn: 'root'
})
export class PreviewPlayersActionService {
  private socket: Socket;
  previewTilesPosition: { x: string; y: number }[] = [];
  firstTilePosition: { x: string; y: number } = { x: "", y: 0 }
  constructor(private socketManagerService: SocketManagerService) {
    this.setUpSocket()

  }

  setUpSocket() {
    this.socket = this.socketManagerService.getSocket();
  }

  addPreviewTile(tilePosition: { x: string; y: number }) {

    this.previewTilesPosition.push(tilePosition);
    if (this.previewTilesPosition.length === 1) {
      this.firstTilePosition = tilePosition
      this.sharePlayerFirstTile(tilePosition);
    }
    if (this.firstTilePosition !== this.previewTilesPosition[0]) {
      this.firstTilePosition = this.previewTilesPosition[0]
      this.removeSelectedTile(this.firstTilePosition);
      this.sharePlayerFirstTile(tilePosition);
    }
  }

  movePreviewTile(formerSpot: { x: string; y: number }, newSpot: { x: string; y: number }) {
    if ((formerSpot.x === this.firstTilePosition.x) && (formerSpot.y === this.firstTilePosition.y)) {
      this.removeSelectedTile(formerSpot);
      this.sharePlayerFirstTile(newSpot)
      this.firstTilePosition = newSpot;
      this.previewTilesPosition = this.previewTilesPosition.filter((previewTiles) => (formerSpot !== previewTiles))
      this.previewTilesPosition.unshift(newSpot);
      return
    }

    this.previewTilesPosition = this.previewTilesPosition.filter((previewTiles) => (formerSpot !== previewTiles))

    this.previewTilesPosition.push(newSpot);
  }

  removePreviewTile(tilePosition: { x: string; y: number }) {
    console.log(this.previewTilesPosition);
    console.log(tilePosition)
    this.previewTilesPosition = this.previewTilesPosition.filter((previewTiles) => ((tilePosition.x !== previewTiles.x) || (tilePosition.y !== previewTiles.y)))
    if ((tilePosition.x === this.firstTilePosition.x) && (tilePosition.y === this.firstTilePosition.y)) {
      this.removeSelectedTile(tilePosition);
      this.sharePlayerFirstTile(this.previewTilesPosition[0])
      this.firstTilePosition = this.previewTilesPosition[0];
    }
    if (this.previewTilesPosition.length === 0) {
      this.firstTilePosition = { x: "", y: 0 }
    }

  };

  sharePlayerFirstTile(activeSquare: { x: string; y: number }) {
    this.socketManagerService.getSocket().emit('Share First Tile', activeSquare);
  }

  getActivePlayerFirstTile(): Observable<{ x: string, y: number }> {
    return new Observable((observer: Observer<{ x: string, y: number }>) => {
      this.socket.on('Get First Tile', (activeSquare: { x: string, y: number }) => observer.next(activeSquare))
    })
  }

  removeSelectedTile(activeSquare: { x: string; y: number }) {
    this.socket.emit('Remove Selected Tile', activeSquare);
  }

  getSelectedTileStatus(): Observable<{ x: string, y: number }> {
    return new Observable((observer: Observer<{ x: string, y: number }>) => {
      this.socket.on('Remove Selected Tile Response', (activeSquare: { x: string, y: number }) => observer.next(activeSquare))
    })
  }

}
