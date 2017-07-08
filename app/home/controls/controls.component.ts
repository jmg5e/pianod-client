import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {PianodService} from '../../services/pianod.service';

@Component({
  selector: 'app-controls',
  moduleId: module.id,
  templateUrl: './controls.component.html',
})
export class ControlsComponent implements OnInit, OnDestroy {
  playback: string;
  playback$: Subscription;
  public constructor(private pianodService: PianodService, private ngZone: NgZone) {}

  public ngOnInit() {
    this.playback$ = this.pianodService.getPlayback().subscribe(playback => {
      this.ngZone.run(() => {
        this.playback = playback;
      });
    });
  }

  public ngOnDestroy() {}

  public play() {
    this.pianodService.sendCmd('PLAY');
    // .then(res => console.dir(res));
  }

  public pause() {
    this.pianodService.sendCmd('PAUSE');
    // .then(res => console.dir(res));
  }

  public stop() {
    this.pianodService.sendCmd('STOP NOW');
    //.then(res => console.dir(res));
  }
}
