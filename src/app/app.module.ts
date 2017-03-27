import 'hammerjs';

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
// import {RouteReuseStrategy, RouterModule, Routes} from '@angular/router';

import {AppComponent} from './app.component';
import {CommandLineComponent} from './command-line/command-line.component';
import {MessagePipe} from './command-line/message.pipe';
import {ConnectComponent} from './connect/connect.component';
import {ControlsComponent} from './controls/controls.component';
import {LoginComponent} from './login/login.component';
import {NowPlayingComponent} from './now-playing/now-playing.component';
import {PlaylistsComponent} from './playlists/playlists.component';
import {
  ConfirmDialogComponent
} from './shared/confirm-dialog/confirm-dialog.component';
import {LocalStorageService} from './shared/local-storage.service';
import {
  LoginDialogComponent
} from './shared/login-dialog/login-dialog.component';
import {PianodService} from './shared/pianod.service';

// const appRoutes: Routes = [
//   {path : '', component : NowPlayingComponent},
//   {path : 'playlists', component : PlaylistsComponent}
// ];

@NgModule({
  declarations : [
    AppComponent, NowPlayingComponent, LoginComponent, ConnectComponent,
    ControlsComponent, LoginDialogComponent, ConfirmDialogComponent,
    CommandLineComponent, MessagePipe, PlaylistsComponent
  ],
  entryComponents : [ LoginDialogComponent, ConfirmDialogComponent ],
  imports : [ BrowserModule, MaterialModule, FormsModule, ReactiveFormsModule ],
  providers : [ PianodService, LocalStorageService ],
  bootstrap : [ AppComponent ]
})
export class AppModule {
}
