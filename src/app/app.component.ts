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
  constructor(private pianodService: PianodService) {
    this.error = this.pianodService.error$;
    this.connected = this.pianodService.connected$;
    this.playback = this.pianodService.playback$;
    this.song = this.pianodService.song$;
    this.user = this.pianodService.user$;

    pianodService.connect('ws://localhost:4446/pianod');
  }
  sendCmd(cmd) { this.pianodService.sendCmd(cmd); }
}
