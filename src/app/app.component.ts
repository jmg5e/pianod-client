import {Component} from '@angular/core';
// import {MdDialog, MdDialogRef, MdSnackBar} from '@angular/material';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';

import {PianodService} from './pianod.service';

@Component({
  selector : 'app-root',
  templateUrl : './app.component.html',
  styleUrls : [ './app.component.scss' ]
  // providers: [MdSnackBar]
})
export class AppComponent {
  error;
  connected;
  playback;
  song;
  user;
  loggedIn = false;
  constructor(private pianodService: PianodService,
              private snackBar: MdSnackBar) {
    let config = new MdSnackBarConfig();
    config.duration = 3000;
    this.error = this.pianodService.error$.subscribe(
        (err) => { this.snackBar.open(err, '', config); }

        );
    this.connected = this.pianodService.connected$;
    this.playback = this.pianodService.playback$;
    this.song = this.pianodService.song$;
    this.user = this.pianodService.user$;
    this.pianodService.user$.subscribe(
        (user) => { this.loggedIn = user.loggedIn; });

    // automatically try and connect get saved url from cookie?
    this.pianodService.connect('ws://localhost:4446/pianod');

    // this.pianodService.sendCmd('user admin admin');
  }

  sendCmd(cmd) { this.pianodService.sendCmd(cmd); }
}
