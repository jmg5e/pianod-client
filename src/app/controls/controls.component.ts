import {Component, Input, OnInit} from '@angular/core';
import {PianodService} from '../pianod.service';
@Component({
  selector : 'app-controls',
  templateUrl : './controls.component.html',
  styleUrls : [ './controls.component.scss' ]
})
export class ControlsComponent implements OnInit {
  @Input() playback: string;

  constructor(private pianodService: PianodService) {}

  ngOnInit() {}
  play() { this.pianodService.sendCmd('play'); }

  pause() { this.pianodService.sendCmd('pause'); }
}
