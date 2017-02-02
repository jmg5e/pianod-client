import {Component, Input, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';
@Component({
  selector : 'app-controls',
  templateUrl : './controls.component.html'
  // styleUrls : [ './controls.component.scss' ]
})
export class ControlsComponent implements OnInit {
  playback: string;
  playbackOptions = [ 'PLAYING', 'PAUSED', 'STOPPED' ];

  constructor(private pianodService: PianodService) {
    this.pianodService.playback$.subscribe(playback => this.playback =
                                               playback);
  }

  ngOnInit() {}
  play() { this.pianodService.sendCmd('play'); }

  pause() { this.pianodService.sendCmd('pause'); }
}
