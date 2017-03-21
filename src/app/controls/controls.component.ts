import {Component, Input, OnInit} from '@angular/core';
import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-controls',
  templateUrl : './controls.component.html',
  styleUrls : [ './controls.component.scss' ]
})
export class ControlsComponent implements OnInit {
  playback: string;
  playbackOptions = [ 'PLAYING', 'PAUSED', 'STOPPED' ];
  currentStation: string;
  stationList: Array<string>;
  @Input() loggedIn;
  constructor(private pianodService: PianodService) {}

  ngOnInit() {
    this.pianodService.getPlayback().subscribe(playback => this.playback =
                                                   playback);
    this.pianodService.getStations().subscribe(stations => this.stationList =
                                                   stations);
    this.pianodService.getCurrentStation().subscribe(
        currentStation => this.currentStation = currentStation);
  }
  play() {
    if (this.loggedIn) {
      this.pianodService.sendCmd('PLAY');
    }
  }

  pause() {
    if (this.loggedIn) {
      this.pianodService.sendCmd('PAUSE');
    }
  }

  stop() {
    if (this.loggedIn) {
      this.pianodService.sendCmd('STOP NOW');
    }
  }

  playMix() {
    if (this.loggedIn) {
      this.pianodService.sendCmd('PLAY MIX');
    }
  }

  changeStation(station) {
    if (this.loggedIn) {
      if (station === 'mix QuickMix') {
        this.pianodService.sendCmd('PLAY MIX');
      } else {
        this.pianodService.sendCmd(`PLAY STATION \"${station}\"`);
      }
    }
  }
}
