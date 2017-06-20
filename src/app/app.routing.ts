import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ConnectedGuard} from './auth/connect.gaurd';
import {CommandLineComponent} from './command-line/command-line.component';
import {ConnectComponent} from './connect/connect.component';
import {HomeComponent} from './home/home.component';
import {NowPlayingComponent} from './now-playing/now-playing.component';
import {SearchComponent} from './search/search.component';
import {StationsComponent} from './stations/stations.component';
// import {ConnectService, LoginService} from './services';
const routes: Routes = [
  {path: '', redirectTo: '/Connect', pathMatch: 'full'},
  {path: 'Connect', component: ConnectComponent}, {
    path: 'Home',
    component: HomeComponent,
    canActivate: [ConnectedGuard],
    children: [
      {path: 'Stations', component: StationsComponent, outlet: 'Stations'},
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
