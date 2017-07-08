import {ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {SongInfo, SongTime} from '../../models';
import {PianodService} from '../../services/pianod.service';

@Component({
  selector: 'app-now-playing',
  moduleId: module.id,
  templateUrl: './now-playing.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class NowPlayingComponent implements OnInit, OnDestroy {
  song: SongInfo;
  song$: Subscription;

  playedTime$: Subscription;
  playedTime: SongTime;
  public constructor(private pianodService: PianodService, private ngZone: NgZone) {}

  public ngOnInit() {
    this.song$ = this.pianodService.getSong().subscribe(song => {
      this.ngZone.run(() => {
        this.song = song;
      });
    });

    this.playedTime$ = this.pianodService.getSongPlayedTime().subscribe(time => {
      this.ngZone.run(() => {
        this.playedTime = time;
      });
    });
  }

  public ngOnDestroy() {
    if (this.song$) {
      this.song$.unsubscribe();
      }
    if (this.playedTime$) {
      this.playedTime$.unsubscribe();
    }
  }
}
