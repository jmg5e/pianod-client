import 'hammerjs';

import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {AppRoutingModule, routingComponents} from './app.routing';
import {MessagePipe} from './command-line/message.pipe';
import {ControlsComponent} from './controls/controls.component';
import {ConfirmDialogComponent, InputDialogComponent, LoginDialogComponent, StationSelectDialogComponent} from './dialogs';
// import {HomeComponent} from './home/home.component';
import {LocalStorageService} from './services/local-storage.service';
import {PianodService} from './services/pianod.service';
import {ManageSeedsComponent} from './stations/manage-seeds.component';
// import {StationsComponent} from './stations/stations.component';

@NgModule({
  declarations: [
    AppComponent, routingComponents, ControlsComponent, LoginDialogComponent,
    ConfirmDialogComponent, StationSelectDialogComponent, ManageSeedsComponent,
    InputDialogComponent, MessagePipe
  ],
  entryComponents: [
    LoginDialogComponent, ConfirmDialogComponent, StationSelectDialogComponent,
    ManageSeedsComponent, InputDialogComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, MaterialModule, FormsModule, ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [PianodService, LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
