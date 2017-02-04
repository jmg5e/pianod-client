import 'hammerjs';

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';

// import {
//   HAMMER_GESTURE_CONFIG,
//   HammerGestureConfig
// } from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {ConnectComponent} from './connect/connect.component';
import {ControlsComponent} from './controls/controls.component';
import {LocalStorageService} from './local-storage.service';
import {
  LoginDialogComponent
} from './login/login-dialog/login-dialog.component';
import {LoginComponent} from './login/login.component';
import {NowPlayingComponent} from './now-playing/now-playing.component';
import {PianodService} from './pianod.service';
import {SearchComponent} from './search/search.component';
import {StationsComponent} from './stations/stations.component';

// const appRoutes: Routes = [
//   {path : 'NowPlaying', component : NowPlayingComponent},
//   {path : 'Settings', component : SettingsComponent},
//   // {path : 'Connect', component : ConnectComponent}
// ];
@NgModule({
  declarations : [
    AppComponent, NowPlayingComponent, LoginComponent, ConnectComponent,
    ControlsComponent, StationsComponent, LoginDialogComponent, SearchComponent
  ],
  entryComponents : [ LoginDialogComponent ],
  // RouterModule.forRoot(appRoutes)
  imports : [
    BrowserModule, MaterialModule.forRoot(), FormsModule, ReactiveFormsModule
  ],
  providers : [ PianodService, LocalStorageService ],
  bootstrap : [ AppComponent ]
})
export class AppModule {
}
