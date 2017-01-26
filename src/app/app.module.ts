import 'hammerjs';

import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';

// import {RouterModule, Routes} from '@angular/router';

import {AppComponent} from './app.component';
import {ConnectComponent} from './connect/connect.component';
import {ControlsComponent} from './controls/controls.component';
import {FindComponent} from './find/find.component';
import {LoginComponent} from './login/login.component';
import {NowPlayingComponent} from './now-playing/now-playing.component';
import {PianodService} from './pianod.service';
import {SettingsComponent} from './settings/settings.component';
import {StationsComponent} from './stations/stations.component';

// const appRoutes: Routes = [
//   {path : 'NowPlaying', component : NowPlayingComponent},
//   {path : 'Settings', component : SettingsComponent},
//   // {path : 'Connect', component : ConnectComponent}
// ];
@NgModule({
  declarations : [
    AppComponent, NowPlayingComponent, SettingsComponent, LoginComponent,
    ConnectComponent, ControlsComponent, StationsComponent, FindComponent
  ],
  // RouterModule.forRoot(appRoutes)
  imports : [
    BrowserModule, MaterialModule.forRoot(), FlexLayoutModule.forRoot(),
    ReactiveFormsModule, FormsModule
  ],
  providers : [ PianodService ],
  bootstrap : [ AppComponent ]
})
export class AppModule {
}
