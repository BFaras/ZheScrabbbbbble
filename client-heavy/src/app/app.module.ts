import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SoloMultiPageComponent } from '@app/pages/solo-multi-page/solo-multi-page.component';
import { AdminPopUpComponent } from './components/admin-pop-up/admin-pop-up.component';
import { ChatComponent } from './components/chat/chat.component';
import { CreateGameComponent } from './components/game-initialisation/create-game/create-game.component';
import { JoinGameComponent } from './components/game-initialisation/join-game/join-game.component';
import { PendingRoomComponent } from './components/game-initialisation/pending-room-join/pending-room.component';
import { WaitingRoomComponent } from './components/game-initialisation/waiting-room/waiting-room.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LetterHolderComponent } from './components/letter-holder/letter-holder.component';
import { LoginAreaComponent } from './components/login-area/login-area.component';
import { SignUpAreaComponent } from './components/sign-up-area/sign-up-area.component';
import { TimerComponent } from './components/timer/timer.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';
import { ChatService } from './services/chat-service/chat.service';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        ChatPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        InfoPanelComponent,
        SoloMultiPageComponent,
        CreateGameComponent,
        JoinGameComponent,
        WaitingRoomComponent,
        ChatComponent,
        LetterHolderComponent,
        TimerComponent,
        LeaderboardComponent,
        AdminPageComponent,
        AdminPopUpComponent,
        LoginPageComponent,
        LoginAreaComponent,
        SignUpPageComponent,
        SignUpAreaComponent,
        ProfilePageComponent,
        PendingRoomComponent
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatDialogModule,
    ],
    providers: [ChatService],
    bootstrap: [AppComponent],
})
export class AppModule {}
