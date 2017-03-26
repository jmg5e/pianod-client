import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

import {LoginComponent} from './login/login.component';
// import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {LocalStorageService} from './shared/local-storage.service';
import {User} from './shared/models/user';
import {PianodService} from './shared/pianod.service';

@Component({
  // changeDetection : ChangeDetectionStrategy.OnPush,
  selector : 'app-root',
  templateUrl : './app.component.html'
})

export class AppComponent implements OnInit, OnDestroy {
  error;
  connected = false; // is set from child ConnectComponent
  playback;
  song;
  user = new User();
  stationList: Array<string>;
  barConfig = new MdSnackBarConfig();
  // SWIPE_ACTION = {LEFT : 'swipeleft', RIGHT : 'swiperight'};
  // selectedTab: number = 0;

  constructor(private pianodService: PianodService,
              private localStorageService: LocalStorageService,
              private snackBar: MdSnackBar) {
    this.barConfig.duration = 3000;
  }

  ngOnInit() {
    this.error = this.pianodService.getErrors().subscribe(
        err => this.showSnackBarMsg(err));

    this.pianodService.getUser().subscribe(user => this.user = user);

    this.pianodService.getConnectionState().subscribe(connectedState => {
      // lost connection
      if (this.connected && connectedState === false) {
        this.showSnackBarMsg('Disconnected from pianod socket.');
      }
      this.connected = connectedState;
    });
    this.pianodService.getPlaylists().subscribe(playlist => console.log(playlist));
  }

  ngOnDestroy() {
    if (this.error) {
      this.error.unsubscribe();
    }
  }

  disconnect() { this.pianodService.disconnect(); }

  showSnackBarMsg(msg: string) { this.snackBar.open(msg, '', this.barConfig); }
}
