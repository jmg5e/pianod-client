import {Component} from '@angular/core';
import {PianodService} from './pianod.service';
@Component({
  selector : 'app-root',
  templateUrl : './app.component.html',
  styleUrls : [ './app.component.css' ]
})
export class AppComponent {
  error;
  connected;
  playback;
  song;
  user;
  loggedIn = false;
  constructor(private pianodService: PianodService) {
    this.error = this.pianodService.error$;
    this.connected = this.pianodService.connected$;
    this.playback = this.pianodService.playback$;
    this.song = this.pianodService.song$;
    this.user = this.pianodService.user$;
    this.pianodService.user$.subscribe(
        (user) => { this.loggedIn = user.loggedIn; });

    // automatically try and connect get saved url from cookie?
    pianodService.connect('ws://localhost:4446/pianod');
  }
  sendCmd(cmd) { this.pianodService.sendCmd(cmd); }
}
