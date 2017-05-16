import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AdminGuard} from './auth/admin.guard';
import {ConnectedGuard} from './auth/connected.guard';
import {StationGuard} from './auth/station.guard';
import {CommandLineComponent} from './command-line/command-line.component';
import {ConnectComponent} from './connect/connect.component';
import {NowPlayingComponent} from './now-playing/now-playing.component';
import {SearchComponent} from './search/search.component';
import {
  EditStationComponent
} from './stations/edit-station/edit-station.component';
import {StationsComponent} from './stations/stations.component';

const appRoutes: Routes = [
  {path : '', redirectTo : '/NowPlaying', pathMatch : 'full'},
  {path : 'Connect', component : ConnectComponent},
  {
    path : 'NowPlaying',
    component : NowPlayingComponent,
    canActivate : [ ConnectedGuard ]
  },
  {
    path : 'Stations',
    component : StationsComponent,
    canActivate : [ ConnectedGuard, AdminGuard ]
  },
  {
    path : 'Stations/:station',
    component : EditStationComponent,
    canActivate : [ ConnectedGuard, AdminGuard, StationGuard ]
  },
  {
    path : 'Search',
    component : SearchComponent,
    canActivate : [ ConnectedGuard, AdminGuard ]
  },
  {
    path : 'CommandLine',
    component : CommandLineComponent,
    canActivate : [ ConnectedGuard, AdminGuard ]
  },
];

@NgModule({
  imports : [ RouterModule.forRoot(appRoutes) ],
  providers : [ ConnectedGuard, AdminGuard, StationGuard ],
  exports : [ RouterModule ]
})
export class AppRoutingModule {
}
