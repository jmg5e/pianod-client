import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {NativeScriptFormsModule} from 'nativescript-angular/forms'
import {ModalDialogService} from 'nativescript-angular/modal-dialog';
import {NativeScriptModule} from 'nativescript-angular/nativescript.module';
import {TNSFontIconModule} from 'nativescript-ng2-fonticon';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app.routing';
import {ConnectComponent} from './connect/connect.component';
import {ConnectModalComponent} from './connect/connect.modal';
import {ConnectionDetailComponent} from './connect/connection-detail.component';
import {SeedComponent} from './home/components/seed.component';
import {ControlsComponent} from './home/controls/controls.component';
import {HomeComponent} from './home/home.component';
import {NowPlayingComponent} from './home/now-playing/now-playing.component';
import {SearchComponent} from './home/search/search.component';
import {MixListComponent} from './home/stations/mixlist.component';
import {StationDetailComponent} from './home/stations/station-detail.component';
import {StationsComponent} from './home/stations/stations.component';
import {LocalStorageService} from './services/local-storage.service';
import {PianodService} from './services/pianod.service';

@NgModule({
  bootstrap: [AppComponent],

  entryComponents: [ConnectModalComponent],
  imports: [
    NativeScriptModule, NativeScriptFormsModule, AppRoutingModule,
    TNSFontIconModule.forRoot({'mdi': 'material-design-icons.css'})
  ],
  declarations: [
    AppComponent, HomeComponent, ConnectComponent, SearchComponent, SeedComponent,
    StationsComponent, StationDetailComponent, ConnectionDetailComponent, ControlsComponent,
    NowPlayingComponent, ConnectModalComponent, MixListComponent
  ],
  providers: [PianodService, LocalStorageService, ModalDialogService],
  schemas: [NO_ERRORS_SCHEMA]
})

export class AppModule {
}
