import {async, injectAsync, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '@angular/material';
import {MdSnackBar} from '@angular/material';

import {AppComponent} from './app.component';
import {ConnectComponent} from './connect/connect.component';
import {ControlsComponent} from './controls/controls.component';
import {LocalStorageService} from './shared/local-storage.service';
import {LoginComponent} from './login/login.component';
import {NowPlayingComponent} from './now-playing/now-playing.component';
import {PianodService} from './shared/pianod.service';
import {SearchComponent} from './search/search.component';
import {StationsComponent} from './stations/stations.component';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports : [ MaterialModule.forRoot(), FormsModule, ReactiveFormsModule ],
      declarations : [
        AppComponent, LoginComponent, ConnectComponent, NowPlayingComponent,
        ControlsComponent, StationsComponent, SearchComponent
      ],
      providers : [ PianodService, LocalStorageService, MdSnackBar ]
    });

    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
      }));
});
