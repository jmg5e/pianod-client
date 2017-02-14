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
  // playbackOptions = [ 'PLAYING', 'PAUSED', 'STOPPED' ];
  song: SongInfo;
  constructor(private pianodService: PianodService) {
    this.pianodService.song$.subscribe(songInfo => this.song = songInfo);
  }

  ngOnInit() {}
}
