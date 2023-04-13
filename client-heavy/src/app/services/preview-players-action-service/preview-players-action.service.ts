import { Injectable } from '@angular/core';
import { PreviewUser } from '@app/classes/preview-user';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { AccountService } from '../account-service/account.service';
import { SocketManagerService } from '../socket-manager-service/socket-manager.service';

@Injectable({
  providedIn: 'root'
})
export class PreviewPlayersActionService {
  private socket: Socket;
  previewTilesPosition: { x: string; y: number }[] = [];
  firstTilePosition: { x: string; y: number } = { x: "", y: 0 };

  previewPartnerFirstTileCoop: { x: string; y: number } | undefined = undefined;
  listPlayersFirstTilesCoop: Map<string, { x: string; y: number }> = new Map<string, { x: string; y: number }>();
  constructor(private socketManagerService: SocketManagerService, private accountService: AccountService) {
    this.setUpSocket()

  }

  setUpSocket() {
    this.socket = this.socketManagerService.getSocket();
  }

  setUpPreviewPartnerFirstTileCoop(value: { x: string; y: number } | undefined) {
    this.previewPartnerFirstTileCoop = value;
    this.listPlayersFirstTilesCoop = new Map<string, { x: string; y: number }>();
  }

  addPreviewTile(tilePosition: { x: string; y: number }) {
    console.log(tilePosition)
    this.previewTilesPosition.push(tilePosition);
    console.log(this.previewTilesPosition)
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
    const playerPosition: PreviewUser = {
      username: this.accountService.getUsername(),
      position: activeSquare
    };
    console.log(playerPosition)
    this.socketManagerService.getSocket().emit('Share First Tile', playerPosition);
  }

  getActivePlayerFirstTile(): Observable<PreviewUser> {
    return new Observable((observer: Observer<PreviewUser>) => {
      this.socket.on('Get First Tile', (otherUserPreview: PreviewUser) => {
        this.listPlayersFirstTilesCoop.set(otherUserPreview.username, otherUserPreview.position)
        this.previewPartnerFirstTileCoop = otherUserPreview.position
        observer.next(otherUserPreview)
      })
    })
  }

  removeSelectedTile(activeSquare: { x: string; y: number }) {
    const playerPosition: PreviewUser = {
      username: this.accountService.getUsername(),
      position: activeSquare
    };
    this.socket.emit('Remove Selected Tile', playerPosition);

  }

  getSelectedTileStatus(): Observable<PreviewUser> {
    return new Observable((observer: Observer<PreviewUser>) => {
      this.socket.on('Remove Selected Tile Response', (otherUserPreview: PreviewUser) => {
        this.previewPartnerFirstTileCoop = undefined
        this.listPlayersFirstTilesCoop.delete(otherUserPreview.username)
        observer.next(otherUserPreview)
      })
    })
  }

  getlistPlayersFirstTilesCoop() {
    return this.listPlayersFirstTilesCoop
  }

  verifyPositionExistInListPlayerTile(postion: { x: string; y: number }) {
    let isLetterPresent = false;
    const listPlayersFirstTilesCoopArray = Array.from(this.listPlayersFirstTilesCoop.values())
    for (let i = 0; i < listPlayersFirstTilesCoopArray.length; i++) {
      if (listPlayersFirstTilesCoopArray[i].x === postion.x && listPlayersFirstTilesCoopArray[i].y === postion.y) {
        isLetterPresent = true;
        console.log(isLetterPresent)
        return isLetterPresent
      }

    }
    console.log(isLetterPresent)
    return isLetterPresent
  }
  getPreviewFirstTileCoop() {
    return this.previewPartnerFirstTileCoop;
  }

}
