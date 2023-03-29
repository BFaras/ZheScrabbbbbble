import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account-service/account.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnDestroy {

  @Output("navLogic") navLogic: EventEmitter<void> = new EventEmitter();
  subscriptionProfileInformation
  constructor(private socketManager: SocketManagerService, private router: Router, private accountService: AccountService) {
    this.subscriptionProfileInformation = this.accountService.getUserProfileInformation().
      subscribe((userProfile) => {
        console.log(userProfile);
        this.accountService.setUpProfile(userProfile);
        this.router.navigate(['/profile-page']);
      })
  }
  ngOnDestroy(): void {
    this.subscriptionProfileInformation.unsubscribe();
  }
  goToProfilePage() {
    this.accountService.askProfileInformation()
    this.callNavLogic();
  }

  disconnectUser() {
    this.socketManager.getSocket().disconnect();
    this.socketManager.createSocket();
  }

  callNavLogic() {
    this.navLogic.emit();
  }
}
