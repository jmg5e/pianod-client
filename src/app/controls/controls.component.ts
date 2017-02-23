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
  constructor(private pianodService: PianodService) {
    this.pianodService.playback$.subscribe(playback => this.playback =
                                               playback);

    this.pianodService.stations$.subscribe((stations) => {
      this.stationList = stations.map(station => station.Name);
    });

    this.pianodService.currentStation$.subscribe(
        currentStation => this.currentStation = currentStation);
  }

  ngOnInit() {}
  play() { this.pianodService.sendCmd('PLAY'); }

  pause() { this.pianodService.sendCmd('PAUSE'); }

  stop() { this.pianodService.sendCmd('STOP NOW'); }

  playMix() { this.pianodService.sendCmd('PLAY MIX'); }

  changeStation(station) {
    if (station === 'mix QuickMix') {
      this.pianodService.sendCmd('PLAY MIX');
    } else {
      this.pianodService.sendCmd(`PLAY STATION \"${station}\"`);
    }
  }
}
