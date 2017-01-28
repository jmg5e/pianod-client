import {Component} from '@angular/core';
// import {MdDialog, MdDialogRef, MdSnackBar} from '@angular/material';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';

import {LocalStorageService} from './local-storage.service';
import {LoginComponent} from './login/login.component';
import {PianodService} from './pianod.service';
import {User} from './user';

@Component({
  selector : 'app-root',
  templateUrl : './app.component.html',
  styleUrls : [ './app.component.scss' ],
  providers : [ LocalStorageService ]
  // providers: [MdSnackBar]
})
export class AppComponent {
  error;
  connected = false; // is set from child ConnectComponent
  playback;
  song;
  user = new User();
  loggedIn = false;
  barConfig = new MdSnackBarConfig();
  constructor(private pianodService: PianodService,
              private snackBar: MdSnackBar) {
    this.barConfig.duration = 3000;

    this.error = this.pianodService.error$.subscribe(
        (err) => { this.snackBar.open(err, '', this.barConfig); });
    this.playback = this.pianodService.playback$;
    this.song = this.pianodService.song$;
  }

  sendCmd(cmd) { this.pianodService.sendCmd(cmd); }

  //  event from connect component
  //  TODO bug after losing connection connect component should be rendered
  userConnected(state) { this.connected = state; }

  userLogin(user) { this.user = user; }
}
