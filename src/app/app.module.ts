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
import {
  LoginDialogComponent
} from './login/login-dialog/login-dialog.component';
import {LoginComponent} from './login/login.component';
import {NowPlayingComponent} from './now-playing/now-playing.component';
import {SearchComponent} from './search/search.component';
import {LocalStorageService} from './shared/local-storage.service';
import {PianodService} from './shared/pianod.service';
import {
  ConfirmDialogComponent
} from './stations/confirm-dialog/confirm-dialog.component';
import {StationsComponent} from './stations/stations.component';

@NgModule({
  declarations : [
    AppComponent,
    NowPlayingComponent,
    LoginComponent,
    ConnectComponent,
    ControlsComponent,
    StationsComponent,
    LoginDialogComponent,
    SearchComponent,
    ConfirmDialogComponent,
  ],
  entryComponents : [ LoginDialogComponent, ConfirmDialogComponent ],
  // RouterModule.forRoot(appRoutes)
  imports : [
    BrowserModule, MaterialModule.forRoot(), FormsModule, ReactiveFormsModule
  ],
  providers : [ PianodService, LocalStorageService ],
  bootstrap : [ AppComponent ]
})
export class AppModule {
}
