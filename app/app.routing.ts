import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {NativeScriptRouterModule} from 'nativescript-angular/router';

import {ConnectGuard} from './auth/connect.guard';
import {ConnectComponent} from './connect/connect.component';
import {ConnectionDetailComponent} from './connect/connection-detail.component';
import {HomeComponent} from './home/home.component';
import {NowPlayingComponent} from './home/now-playing/now-playing.component';
import {StationsComponent} from './home/stations/stations.component';
import {MixListComponent} from './home/stations/mixlist.component';
import {StationDetailComponent} from './home/stations/station-detail.component';

const routes: Routes = [
  {path: '', redirectTo: '/Connect', pathMatch: 'full'},
  {path: 'Connect', component: ConnectComponent},
  {path: 'Connect/:host/:port', component: ConnectionDetailComponent}, {
    path: 'Home',
    component: HomeComponent,
    canActivate: [ConnectGuard],
    children: [
      // {path: '', redirectTo: 'NowPlaying', pathMatch: 'full'},
      {path: 'NowPlaying', component: NowPlayingComponent, outlet: 'NowPlaying'},
      {path: 'Stations', component: StationsComponent, outlet: 'Stations'},
      {path: 'Stations/Mix', component: MixListComponent, outlet: 'Stations'},
      {path: 'Stations/:name', component: StationDetailComponent, outlet: 'Stations'},
    ]
  },
  // {path: 'Login', component: LoginComponent, canActivate: [ConnectedGuard]},
  // {path: 'Main/NowPlaying', component: NowPlayingComponent, canActivate: [ConnectedGuard]}
  // { path: "item/:id", component: ItemDetailComponent },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  providers: [ConnectGuard],
  exports: [NativeScriptRouterModule]
})
export class AppRoutingModule {
}
