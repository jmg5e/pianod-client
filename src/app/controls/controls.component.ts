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
  currentPlaylist: string;
  playLists: Array<string>;
  @Input() privileges;

  constructor(private pianodService: PianodService) {}

  ngOnInit() {
    this.pianodService.getPlayback().subscribe(playback => this.playback =
                                                   playback);
    // this.pianodService.getStations().subscribe(stations => this.stationList =
    //                                                stations);
    // this.pianodService.getCurrentStation().subscribe(
    //     currentStation => this.currentStation = currentStation);
  }
  play() {
    if (this.privileges.admin) {
      this.pianodService.sendCmd('PLAY');
    }
  }

  pause() {
    if (this.privileges.admin) {
      this.pianodService.sendCmd('PAUSE');
    }
  }

  stop() {
    if (this.privileges.admin) {
      this.pianodService.sendCmd('STOP NOW');
    }
  }

  playMix() {
    if (this.privileges.admin) {
      this.pianodService.sendCmd('PLAY MIX');
    }
  }

  changeStation(station) {
    if (this.privileges.admin) {
      if (station === 'mix QuickMix') {
        this.pianodService.sendCmd('PLAY MIX');
      } else {
        this.pianodService.sendCmd(`PLAY STATION \"${station}\"`);
      }
    }
  }
}
