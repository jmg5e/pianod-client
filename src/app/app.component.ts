import {Component} from '@angular/core';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
// import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {LocalStorageService} from './local-storage.service';
import {LoginComponent} from './login/login.component';
import {PianodService} from './pianod.service';
import {User} from './user';

@Component({
  selector : 'app-root',
  templateUrl : './app.component.html',
  styleUrls : [ './app.component.scss' ],
  providers : [ LocalStorageService ]
})

export class AppComponent {
  error;
  connected = false; // is set from child ConnectComponent
  playback;
  song;
  user = new User();
  loggedIn = false;
  barConfig = new MdSnackBarConfig();
  // SWIPE_ACTION = {LEFT : 'swipeleft', RIGHT : 'swiperight'};
  selectedTab: number = 0;

  constructor(private pianodService: PianodService,
              private localStorageService: LocalStorageService,
              private snackBar: MdSnackBar) {
    // window.localStorage.clear();
    this.barConfig.duration = 3000;

    this.error = this.pianodService.error$.subscribe(
        (err) => { this.snackBar.open(err, '', this.barConfig); });
    this.playback = this.pianodService.playback$;
    this.song = this.pianodService.song$;
  }

  // nextTab() {
  //   if (this.selectedTab < 3) {
  //     this.selectedTab++;
  //   }
  // }
  // prevTab() {
  //   if (this.selectedTab > 0) {
  //     this.selectedTab--;
  //   }
  // }

  disconnect() {
    console.log('disconect()');
    this.localStorageService.remove('pianodUrl');
    this.pianodService.disconnect();
    this.connected = false;
  }

  //  event from child component
  //  TODO bug after losing connection connect component should be rendered
  userConnected(state) { this.connected = state; }

  userLogin(user) { this.user = user; }
}
