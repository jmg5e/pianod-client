import 'hammerjs';

import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {AppRoutingModule, routingComponents} from './app.routing';
import {MessagePipe} from './command-line/message.pipe';
import {ConfirmDialogComponent, InputDialogComponent, LoginDialogComponent, StationSelectDialogComponent} from './dialogs';
import {LocalStorageService} from './services/local-storage.service';
import {PianodService} from './services/pianod.service';
import {ControlsComponent} from './home/controls/controls.component';
import { SeedComponent } from './components/seed.component';
import {ManageSeedsComponent} from './components/manage-seeds.component';

@NgModule({
  declarations: [
    AppComponent, routingComponents, ControlsComponent, LoginDialogComponent,
    ConfirmDialogComponent, StationSelectDialogComponent, ManageSeedsComponent,
    InputDialogComponent, MessagePipe, SeedComponent
  ],
  entryComponents: [
    LoginDialogComponent, ConfirmDialogComponent, StationSelectDialogComponent,
    ManageSeedsComponent, InputDialogComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, MaterialModule, FlexLayoutModule, FormsModule,
    ReactiveFormsModule, AppRoutingModule
  ],
  providers: [PianodService, LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
