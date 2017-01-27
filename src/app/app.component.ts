import {Component} from '@angular/core';
// import {MdDialog, MdDialogRef, MdSnackBar} from '@angular/material';
import {MdSnackBar, MdSnackBarConfig} from '@angular/material';
import {LocalStorageService} from './local-storage.service';
import {PianodService} from './pianod.service';

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
  user;
  loggedIn = false;
  barConfig = new MdSnackBarConfig();
  constructor(private pianodService: PianodService,
              private snackBar: MdSnackBar,
              private localStorage: LocalStorageService) {

    this.barConfig.duration = 3000;

    this.error = this.pianodService.error$.subscribe(
        (err) => { this.snackBar.open(err, '', this.barConfig); });
    this.playback = this.pianodService.playback$;
    this.song = this.pianodService.song$;
    this.user = this.pianodService.user$;
    this.pianodService.user$.subscribe(
        (user) => { this.loggedIn = user.loggedIn; });
  }

  sendCmd(cmd) { this.pianodService.sendCmd(cmd); }

  //  event from connect component
  //  TODO bug losing connection does not render connect component
  userConnected(state) { this.connected = state; }

  showLogin() { console.log('show login'); }

  //  event from login component
  // userLoggedIn(user) { this.user = user; }
}
