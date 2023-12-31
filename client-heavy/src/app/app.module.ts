import { PortalModule } from '@angular/cdk/portal';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BlankTilePopUpComponent } from './components/blank-tile-pop-up/blank-tile-pop-up.component';
import { ChangeNamePopUpComponent } from './components/change-name-pop-up/change-name-pop-up.component';
import { ChatComponent } from './components/chat/chat.component';
import { ConnectionHistoryAreaComponent } from './components/connection-history-area/connection-history-area.component';
import { FormerActionHistoryAreaComponent } from './components/former-action-history-area/former-action-history-area.component';
import { CreateGameComponent } from './components/game-initialisation/create-game/create-game.component';
import { JoinGameComponent } from './components/game-initialisation/join-game/join-game.component';
import { ObserverRoomComponent } from './components/game-initialisation/observer-room/observer-room.component';
import { PasswordInputComponent } from './components/game-initialisation/password-input-dialog/password-input.component';
import { PendingRoomComponent } from './components/game-initialisation/pending-room-join/pending-room.component';
import { WaitingRoomComponent } from './components/game-initialisation/waiting-room/waiting-room.component';
import { LanguageComponent } from './components/language/language.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LetterHolderComponent } from './components/letter-holder/letter-holder.component';
import { LoginAreaComponent } from './components/login-area/login-area.component';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { PasswordLostAreaComponent } from './components/password-lost-area/password-lost-area.component';
import { AvatarPopUpComponent } from './components/profil-pop-up/avatar-pop-up/avatar-pop-up.component';
import { SignUpAreaComponent } from './components/sign-up-area/sign-up-area.component';
import { SignUpAvatarPopUpComponent } from './components/sign-up-avatar-pop-up/sign-up-avatar-pop-up.component';
import { TimerComponent } from './components/timer/timer.component';
import { WindowComponent } from './components/window/window.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { FriendsPageComponent } from './pages/friends-page/friends-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { PasswordLostPageComponent } from './pages/password-lost-page/password-lost-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { PublicChatsComponent } from './pages/public-chats/public-chats.component';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';
import { BracketPageComponent } from './pages/tournament-pages/bracket-page/bracket-page.component';
import { QueuePageComponent } from './pages/tournament-pages/queue-page/queue-page.component';
import { ResultPageComponent } from './pages/tournament-pages/result-page/result-page.component';
import { ChatService } from './services/chat-service/chat.service';
import { ConfrimPopUpComponent } from './components/confrim-pop-up/confrim-pop-up.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
/*
export function httpTranslateLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}
*/

export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

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
        LoginPageComponent,
        LoginAreaComponent,
        SignUpPageComponent,
        SignUpAreaComponent,
        ProfilePageComponent,
        AvatarPopUpComponent,
        WindowComponent,
        PendingRoomComponent,
        ObserverRoomComponent,
        PasswordInputComponent,
        PasswordLostPageComponent,
        PasswordLostAreaComponent,
        LanguageComponent,
        NavigationBarComponent,
        FriendsPageComponent,
        PublicChatsComponent,
        QueuePageComponent,
        BracketPageComponent,
        ResultPageComponent,
        SignUpAvatarPopUpComponent,
        BlankTilePopUpComponent,
        ConnectionHistoryAreaComponent,
        FormerActionHistoryAreaComponent,
        ChangeNamePopUpComponent,
        ConfrimPopUpComponent
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        PortalModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatDialogModule,
        TranslateModule.forRoot({
            defaultLanguage: 'fr',
            loader: {
                provide: TranslateLoader,
                useFactory: (HttpLoaderFactory),
                deps: [HttpClient]
            }
        })
    ],
    providers: [ChatService, ProfilePageComponent, LanguageComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
