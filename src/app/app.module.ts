import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

// import {RouterModule, Routes} from '@angular/router';

import {AppComponent} from './app.component';
import {ConnectComponent} from './connect/connect.component';
import {ControlsComponent} from './controls/controls.component';
import {LoginComponent} from './login/login.component';
import {NowPlayingComponent} from './now-playing/now-playing.component';
import {PianodService} from './pianod.service';
import {SettingsComponent} from './settings/settings.component';
import { StationsComponent } from './stations/stations.component';

// const appRoutes: Routes = [
//   {path : 'NowPlaying', component : NowPlayingComponent},
//   {path : 'Settings', component : SettingsComponent},
//   // {path : 'Connect', component : ConnectComponent}
// ];
@NgModule({
  declarations : [
    AppComponent, NowPlayingComponent, SettingsComponent, LoginComponent,
    ConnectComponent, ControlsComponent, StationsComponent
  ],
  // RouterModule.forRoot(appRoutes)
  imports : [ BrowserModule, FormsModule ],
  providers : [ PianodService ],
  bootstrap : [ AppComponent ]
})
export class AppModule {
}
