import {Component, Input, OnInit} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SongInfo} from '../shared/models/song-info';
import {PianodService} from '../shared/pianod.service';

@Component({
  selector : 'app-now-playing',
  templateUrl : './now-playing.component.html',
  styleUrls : [ './now-playing.component.scss' ]
})
export class NowPlayingComponent implements OnInit {
  // @Input() songInfo: SongInfo;
  // @Input() playback: string;
  remainingTime$;
  // playbackOptions = [ 'PLAYING', 'PAUSED', 'STOPPED' ];
  song: SongInfo;
  song$;
  constructor(private pianodService: PianodService) {
    // this.pianodService.playback$( playback => {
    //
    // });
  }

  ngOnInit() {
    this.remainingTime$ = this.pianodService.getSongRemainingTime();
    // this.pianodService.getSongRemainingTime().subscribe(
    //     result => { console.log(result); });
    this.song$ =
        this.pianodService.song$.subscribe(songInfo => this.song = songInfo);
  }
}
