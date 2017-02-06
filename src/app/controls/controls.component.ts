import {Component, Input, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';

@Component({
  selector : 'app-controls',
  templateUrl : './controls.component.html',
  styleUrls : [ './controls.component.scss' ]
})
export class ControlsComponent implements OnInit {
  playback: string;
  playbackOptions = [ 'PLAYING', 'PAUSED', 'STOPPED' ];
  currentStation: string;

  constructor(private pianodService: PianodService) {
    this.pianodService.playback$.subscribe(playback => this.playback =
                                               playback);
    this.pianodService.currentStation$.subscribe(
        currentStation => this.currentStation = currentStation);
  }

  ngOnInit() {}
  play() { this.pianodService.sendCmd('PLAY'); }

  pause() { this.pianodService.sendCmd('PAUSE'); }

  toggleMix() {
    if (this.currentStation !== 'mix QuickMix') {
      this.pianodService.sendCmd('PLAY MIX');
    } else {
      // this.pianodService.sendCmd('PLAY STATION Default');
    }
  }
}
