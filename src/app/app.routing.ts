import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ConnectedGuard} from './auth/connect.gaurd';
import {CommandLineComponent} from './command-line/command-line.component';
import {ConnectComponent} from './connect/connect.component';
import {HomeComponent} from './home/home.component';
import {NowPlayingComponent} from './home/now-playing/now-playing.component';
import {SearchComponent} from './home/search/search.component';
import {StationsComponent} from './home/stations/stations.component';
// import {ConnectService, LoginService} from './services';
const routes: Routes = [
  {path: '', redirectTo: '/Connect', pathMatch: 'full'},
  {path: 'Connect', component: ConnectComponent}, {
    path: 'Home',
    component: HomeComponent,
    canActivate: [ConnectedGuard],
    children: [
      // {path: '', redirectTo: 'NowPlaying', pathMatch: 'full'},
      {path: '', component: NowPlayingComponent},
      {path: 'NowPlaying', component: NowPlayingComponent},
      {path: 'Stations', component: StationsComponent},
      {path: 'Search', component: SearchComponent},
      {path: 'CommandLine', component: CommandLineComponent},
    ]
  }
];

@NgModule(
    {imports: [RouterModule.forRoot(routes)], exports: [RouterModule], providers: [ConnectedGuard]})

export class AppRoutingModule {
  }

export const routingComponents = [
  ConnectComponent, HomeComponent, NowPlayingComponent, StationsComponent, SearchComponent,
  CommandLineComponent
];
