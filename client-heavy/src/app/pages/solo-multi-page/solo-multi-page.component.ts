import { Component } from '@angular/core';
import { FriendsService } from '@app/services/friends.service';

@Component({
    selector: 'app-solo-multi-page',
    templateUrl: './solo-multi-page.component.html',
    styleUrls: ['./solo-multi-page.component.scss'],
})
export class SoloMultiPageComponent {
    constructor(private friendsService: FriendsService){}

    resetFriendInvite(){
        this.friendsService.setFriendToInvite('');
    }
}
