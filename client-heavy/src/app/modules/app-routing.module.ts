import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateGameComponent } from '@app/components/game-initialisation/create-game/create-game.component';
import { JoinGameSetupComponent } from '@app/components/game-initialisation/join-game-setup/join-game-setup.component';
import { JoinGameComponent } from '@app/components/game-initialisation/join-game/join-game.component';
import { WaitingRoomComponent } from '@app/components/game-initialisation/waiting-room/waiting-room.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SoloMultiPageComponent } from '@app/pages/solo-multi-page/solo-multi-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'admin', component: AdminPageComponent },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'solo-multi', component: SoloMultiPageComponent },
    { path: 'create-game', component: CreateGameComponent },
    { path: 'join-game', component: JoinGameComponent },
    { path: 'join-game-setup', component: JoinGameSetupComponent },
    { path: 'waiting-room', component: WaitingRoomComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
